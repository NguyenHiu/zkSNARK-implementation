const Transaction = require("../components/transaction.js");
const AccountTree = require("../components/accountTree.js");
const { buildEddsa, buildMimc7 } = require("circomlibjs");
const Account = require("../components/account.js");
const TxTree = require("../components/txTree.js");
const { ethers } = require("ethers");
const ganache = require("ganache");
const snarkjs = require("snarkjs");
const fs = require("fs");
const {
    getDepositRegisterInputCircuit,
    createUserL2,
    uint8Array2Hex,
    hex2Uint8Array,
    ZeroPubKeyX,
    ZeroPubKeyY,
    createUserL1,
    getL1Address
} = require("../components/utils.js");

const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');
const multer = require('multer');
const upload = multer();
const app = express();


async function InitState() {
    // custom & create local blockchain
    const options = {
        wallet: {
            totalAccounts: "20",
            accountKeysPath: "build/ganache_accounts/accounts.json",
            defaultBalance: "10000"
        }
    }
    const ganacheProvider = ganache.provider(options);
    const Provider = new ethers.providers.Web3Provider(ganacheProvider);

    // deployer: account deploys smart contract
    const deployer = Provider.getSigner(0);

    // deploy mimc hash function into the network
    const { createCode, abi } = await import("../../node_modules/circomlibjs/src/mimc7_gencontract.js");
    const mimcjs = await buildMimc7();
    const C = new ethers.ContractFactory(abi, createCode("mimc", 91), deployer);
    const mimc = await C.deploy();
    await mimc.deployTransaction.wait();

    // initialize account tree with 8 account slots 
    const Zero = new Account(0, ZeroPubKeyX, ZeroPubKeyY, 0, 0, mimcjs);
    const accountTree = new AccountTree(new Array(8).fill(Zero), mimcjs);

    // deploy main smart contract (middleware) into the network
    const Middleware = require("../../build/contracts/Middleware.json");
    const M = new ethers.ContractFactory(Middleware.abi, Middleware.bytecode, deployer);
    const middleware = await M.deploy(
        mimc.address,
        "0x" + mimcjs.F.toString(accountTree.root, 16).padStart(64, "0"));
    await middleware.deployTransaction.wait();

    // Edwards-Curve Digital Signature Algorithm
    const eddsa = await buildEddsa();

    return {
        accountTree: accountTree,
        provider: Provider,
        mimcjs: mimcjs,
        eddsa: eddsa,
        middleware: middleware
    };
}

exports.appPromise = InitState().then(function ({ accountTree, provider, mimcjs, eddsa, middleware }) {

    // get accounts
    const _accounts = require("../../build/ganache_accounts/accounts.json");
    const addresses = Object.keys(_accounts.addresses);
    const privateKeys = Object.values(_accounts.private_keys);

    // debug
    const demo = {
        "publicKey": {},
        "coordinator": {
            "address": addresses[0],
            "privateKey": privateKeys[0]
        }
    };
    for (let i = 0; i < 15; ++i) {
        demo["publicKey"][i + 1] = (new ethers.Wallet(privateKeys[i + 1])).publicKey;
    }
    fs.writeFileSync("build/ganache_accounts/demo.json", JSON.stringify(demo));
    //

    // create Coordinator
    const coordinatorAddress = createUserL2(0, privateKeys[0], mimcjs, eddsa).l1Address;
    const coordinatorWallet = new ethers.Wallet(privateKeys[0]);
    console.log("COORDINATOR.ADDRESS: ", coordinatorAddress);

    // deposit register transactions
    let depositRegisterTxs = [];
    let depositExistenceTxs = [];

    // listeners
    middleware.on(
        "eDepositRegister(bytes32,bytes32,bytes32,bytes32,uint,bytes32,bytes32,bytes32)",
        (fromX, fromY, toX, toY, amount, R8X, R8Y, S) => {
            const newTx = new Transaction(
                mimcjs.F.e(fromX, 16), mimcjs.F.e(fromY, 16),
                mimcjs.F.e(toX, 16), mimcjs.F.e(toY, 16),
                mimcjs.F.e(0), mimcjs.F.e(amount),
                mimcjs.F.e(R8X, 16), mimcjs.F.e(R8Y, 16), BigInt(S, 16), mimcjs
            );
            if (newTx.checkSignature(mimcjs, eddsa) == false)
                console.log("[ERROR] Event check signature is wrong");
            else {
                console.log("[DEPOSIT Register SUCCESSFULLY]");
                depositRegisterTxs.push(newTx);
            }
        })
    middleware.on(
        "eDepositExistence(bytes32,bytes32,bytes32,bytes32,uint,bytes32,bytes32,bytes32)",
        (fromX, fromY, toX, toY, amount, R8X, R8Y, S) => {
            const newTx = new Transaction(
                mimcjs.F.e(fromX, 16), mimcjs.F.e(fromY, 16),
                mimcjs.F.e(toX, 16), mimcjs.F.e(toY, 16),
                mimcjs.F.e(0), mimcjs.F.e(amount),
                mimcjs.F.e(R8X, 16), mimcjs.F.e(R8Y, 16), BigInt(S, 16), mimcjs
            );
            if (newTx.checkSignature(mimcjs, eddsa) == false)
                console.log("[ERROR] Event check signature is wrong");
            else {
                console.log("[DEPOSIT Exitence SUCCESSFULLY]");
                depositExistenceTxs.push(newTx);
            }
        })
    middleware.on("sDepositRegister(bool)", (x) => { console.log("[UPDATE STATE SUCCESSFULLY]"); })
    // debug listeners
    middleware.on("dDebug(bool)", (x) => console.log("dDebug(bool): ", x))
    middleware.on("dGetUint(uint)", (x) => console.log("dGetUint(uint)): ", x));
    middleware.on("dGetBytes32(bytes32)", (x) => console.log("dGetBytes32(bytes32):\n", x));
    middleware.on("dGetAddress(address)", (add) => console.log("dGetAddress(address):", add));
    middleware.on("dGetBytes32Array(bytes32[])", (arr) => { });
    middleware.on("dGetString(string)", (str) => { console.log(str); })

    app.set('view engine', 'pug');
    app.set('views', './scripts/main/views');
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session({
        resave: false, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something stored
        secret: 'shhhh, very secret'
    }));
    app.use(bodyParser.json());
    app.use(upload.array());

    // login page
    function login(address, privateKey, fn) {
        for (let i = 0; i < addresses.length; ++i)
            if (addresses[i] == address) {
                if (privateKeys[i] == privateKey)
                    return fn(null, createUserL2(i, privateKey, mimcjs, eddsa));
                else
                    return fn("private key is incorrect!", null);
            }
        return fn("address does not exist", null);
    }
    app.get("/login", function (req, res) {
        res.render("login");
    })
    app.post('/login', function (req, res) {
        login(req.body.address, req.body.privateKey, function (err, user) {
            if (err != null) {
                console.log("err: ", err);
                req.session.error = "Login fail!";
                res.redirect('/login');
            }
            else {
                console.log("user: ", user);
                req.session.user = user;
                req.session.success = "Login successfully!";
                res.redirect('/main');
            }
        });
    });

    // main page
    function restrict(req, res, next) {
        if (req.session.user != null) {
            next();
        } else {
            req.session.error = 'Access denied!';
            res.redirect('/login');
        }
    }
    app.get("/main", restrict, function (req, res) {
        res.render("main", {
            address: req.session.user.l1Address,
            privateKey: req.session.user.originalPrvkey,
            coordinatorAddress: coordinatorAddress,
        });
    })
    // create a transaction
    app.post('/main', restrict, function (req, res) {
        const fromX = hex2Uint8Array(req.session.user.pubkeyX);
        const fromY = hex2Uint8Array(req.session.user.pubkeyY);
        const toX = hex2Uint8Array("0x" + req.body.toPublicKey.slice(4, 68));
        const toY = hex2Uint8Array("0x" + req.body.toPublicKey.slice(68));
        const amount = req.body.amount;
        const tx = new Transaction(
            mimcjs.F.e(fromX), mimcjs.F.e(fromY),
            mimcjs.F.e(toX), mimcjs.F.e(toY),
            mimcjs.F.e(0), mimcjs.F.e(amount),
            0, 0, 0, mimcjs);
        tx.signTxHash(hex2Uint8Array(req.session.user.prvkey), mimcjs, eddsa);

        const c = (x) => {
            return "0x" + mimcjs.F.toString(x, 16).padStart(64, "0");
        }

        if (tx.checkSignature(mimcjs, eddsa) == false) {
            console.log("[ERROR] SIGNTURE IS WRONG!");
        }
        else {
            console.log("[Sent Transaction]");
            const R8X = tx.R8X;
            const R8Y = tx.R8Y;
            const S = "0x" + tx.S.toString(16).padStart(64, "0");
            middleware.connect(provider.getSigner(req.session.user.index)).
                deposit(
                    c(fromX), c(fromY),
                    c(toX), c(toY),
                    amount, c(R8X), c(R8Y), S,
                    {
                        from: req.session.user.l1Address,
                        value: BigInt(amount) * (BigInt(10) ** BigInt(18)),
                        gasLimit: 3000000
                    });
        }
    })

    // process deposit register page
    function isCoordinator(req, res, next) {
        if (req.session.user && req.session.user.l1Address == coordinatorAddress) {
            next();
        } else {
            req.session.error = 'Access denied!';
            res.redirect('back');
        }
    }
    app.post('/process_deposit_register', isCoordinator, async function (req, res) {
        // get 2^x transactions
        const noTx = 2 ** Math.floor(Math.log2(depositRegisterTxs.length));
        const txs = depositRegisterTxs.slice(0, noTx);
        depositRegisterTxs = depositRegisterTxs.slice(noTx);

        // process 2^x transactions into account tree
        const depositRegisterTxTree = new TxTree(txs, mimcjs);
        const state = accountTree.processDepositRegisterTxTree(depositRegisterTxTree, mimcjs, eddsa);
        const _proof = getDepositRegisterInputCircuit(state, mimcjs);

        fs.writeFile(
            "build/inputs/1_test_deposit_register_proof.json",
            JSON.stringify(_proof),
            'utf-8',
            () => { });

        // generate proof
        const wasm = "build/circuits/deposit_register_verifier/deposit_register_verifier_js/deposit_register_verifier.wasm";
        const zkey = "build/circuits/deposit_register_verifier/deposit_register_verifier_1.zkey"
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(_proof, wasm, zkey);
        const rawCallData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
        const jsonCallData = JSON.parse("[" + rawCallData + "]")

        // send onchain
        middleware.verifyProof_DepositRegister(
            jsonCallData[0], jsonCallData[1],
            jsonCallData[2], jsonCallData[3],
            {
                from: coordinatorWallet.address,
                value: 0,
                gasLimit: 500000
            });
    });
    app.post('/process_deposit_existence', isCoordinator, async function (req, res) {
        // get 2^x transactions
        const noTx = 2 ** Math.floor(Math.log2(depositExistenceTxs.length));
        const txs = depositExistenceTxs.slice(0, noTx);
        depositExistenceTxs = depositExistenceTxs.slice(noTx);

        // process 2^x transactions into account tree
        const depositExistenceTree = new TxTree(txs, mimcjs);
        const state = accountTree.processDepositExistenceTree(depositExistenceTree, mimcjs, eddsa);
        // const _proof = getDepositExistenceInputCircuit(state, mimcjs);

        // fs.writeFile(
        //     "build/inputs/1_test_deposit_register_proof.json",
        //     JSON.stringify(_proof),
        //     'utf-8',
        //     () => { });

        // // generate proof
        // const wasm = "build/circuits/deposit_register_verifier/deposit_register_verifier_js/deposit_register_verifier.wasm";
        // const zkey = "build/circuits/deposit_register_verifier/deposit_register_verifier_1.zkey"
        // const { proof, publicSignals } = await snarkjs.groth16.fullProve(_proof, wasm, zkey);
        // const rawCallData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
        // const jsonCallData = JSON.parse("[" + rawCallData + "]")

        // // send onchain
        // middleware.verifyProof_DepositRegister(
        //     jsonCallData[0], jsonCallData[1],
        //     jsonCallData[2], jsonCallData[3],
        //     {
        //         from: coordinatorWallet.address,
        //         value: 0,
        //         gasLimit: 500000
        //     });
    });

    app.get("/accountTree", function (req, res) {
        res.render("accountTree", {
            accountTree: accountTree.getAccountTreeAsText(mimcjs)
        })
    })

    /*  DEBUG AREA */
    app.post("/debug_deposit_register", function (req, res) {
        req.session.user = createUserL2(0, privateKeys[0], mimcjs, eddsa);
        const fromX = hex2Uint8Array(req.session.user.pubkeyX);
        const fromY = hex2Uint8Array(req.session.user.pubkeyY);
        for (let i = 0; i < 5; ++i) {
            const user = createUserL2(i + 1, privateKeys[i + 1], mimcjs, eddsa);
            const toX = hex2Uint8Array(user.pubkeyX);
            const toY = hex2Uint8Array(user.pubkeyY);
            const amount = 10;
            const tx = new Transaction(
                mimcjs.F.e(fromX), mimcjs.F.e(fromY),
                mimcjs.F.e(toX), mimcjs.F.e(toY),
                mimcjs.F.e(0), mimcjs.F.e(amount),
                0, 0, 0, mimcjs);
            tx.signTxHash(hex2Uint8Array(req.session.user.prvkey), mimcjs, eddsa);

            const c = (x) => {
                return "0x" + mimcjs.F.toString(x, 16).padStart(64, "0");
            }

            if (tx.checkSignature(mimcjs, eddsa) == false) {
                console.log("[ERROR] SIGNTURE IS WRONG!");
            }
            else {
                console.log("[Sent Transaction]");
                const R8X = tx.R8X;
                const R8Y = tx.R8Y;
                const S = "0x" + tx.S.toString(16).padStart(64, "0");
                middleware.connect(provider.getSigner(req.session.user.index)).
                    deposit(
                        c(fromX), c(fromY),
                        c(toX), c(toY),
                        amount, c(R8X), c(R8Y), S,
                        {
                            from: req.session.user.l1Address,
                            value: 0,
                            gasLimit: 300000
                        });
            }
        }
        res.redirect("/main");
    });
    app.post("/debug_process_deposit_register", async function (req, res) {
        const noTx = 2 ** Math.floor(Math.log2(depositRegisterTxs.length));
        const txs = depositRegisterTxs.slice(0, noTx);
        depositRegisterTxs = depositRegisterTxs.slice(noTx);

        const depositRegisterTxTree = new TxTree(txs, mimcjs);
        const state = accountTree.processDepositRegisterTxTree(depositRegisterTxTree, mimcjs, eddsa);
        const _proof = getDepositRegisterInputCircuit(state, mimcjs);

        fs.writeFile(
            "build/inputs/1_test_deposit_register_proof.json",
            JSON.stringify(_proof),
            'utf-8',
            () => { });

        const wasm = "build/circuits/deposit_register_verifier/deposit_register_verifier_js/deposit_register_verifier.wasm";
        const zkey = "build/circuits/deposit_register_verifier/deposit_register_verifier_1.zkey"
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(_proof, wasm, zkey);
        const rawCallData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
        const jsonCallData = JSON.parse("[" + rawCallData + "]")

        middleware.verifyProof_DepositRegister(
            jsonCallData[0], jsonCallData[1],
            jsonCallData[2], jsonCallData[3],
            {
                from: coordinatorWallet.address,
                value: 0,
                gasLimit: 500000
            }).then(x => console.log);
    });
    app.post("/debug_deposit_existence", function (req, res) {
        req.session.user = createUserL2(0, privateKeys[0], mimcjs, eddsa);
        const fromX = hex2Uint8Array(req.session.user.pubkeyX);
        const fromY = hex2Uint8Array(req.session.user.pubkeyY);
        for (let i = 0; i < 5; ++i) {
            const user = createUserL2(i + 1, privateKeys[i + 1], mimcjs, eddsa);
            const toX = hex2Uint8Array(user.pubkeyX);
            const toY = hex2Uint8Array(user.pubkeyY);
            const amount = 10;
            const tx = new Transaction(
                mimcjs.F.e(fromX), mimcjs.F.e(fromY),
                mimcjs.F.e(toX), mimcjs.F.e(toY),
                mimcjs.F.e(0), mimcjs.F.e(amount),
                0, 0, 0, mimcjs);
            tx.signTxHash(hex2Uint8Array(req.session.user.prvkey), mimcjs, eddsa);

            const c = (x) => {
                return "0x" + mimcjs.F.toString(x, 16).padStart(64, "0");
            }

            if (tx.checkSignature(mimcjs, eddsa) == false) {
                console.log("[ERROR] SIGNTURE IS WRONG!");
            }
            else {
                console.log("[Sent Transaction]");
                const R8X = tx.R8X;
                const R8Y = tx.R8Y;
                const S = "0x" + tx.S.toString(16).padStart(64, "0");
                middleware.connect(provider.getSigner(req.session.user.index)).
                    deposit(
                        c(fromX), c(fromY),
                        c(toX), c(toY),
                        amount, c(R8X), c(R8Y), S,
                        {
                            from: req.session.user.l1Address,
                            value: 0,
                            gasLimit: 300000
                        });
            }
        }
        res.redirect("/main");
    });
    app.post("/debug_process_deposit_existence", async function (req, res) {
        // get 2^x transactions
        const noTx = 2 ** Math.floor(Math.log2(depositExistenceTxs.length));
        const txs = depositExistenceTxs.slice(0, noTx);
        depositExistenceTxs = depositExistenceTxs.slice(noTx);

        // process 2^x transactions into account tree
        const depositExistenceTree = new TxTree(txs, mimcjs);
        const state = accountTree.processDepositExistenceTree(depositExistenceTree, mimcjs, eddsa);
        // const _proof = getDepositExistenceInputCircuit(state, mimcjs);

        // fs.writeFile(
        //     "build/inputs/1_test_deposit_register_proof.json",
        //     JSON.stringify(_proof),
        //     'utf-8',
        //     () => { });

        // // generate proof
        // const wasm = "build/circuits/deposit_register_verifier/deposit_register_verifier_js/deposit_register_verifier.wasm";
        // const zkey = "build/circuits/deposit_register_verifier/deposit_register_verifier_1.zkey"
        // const { proof, publicSignals } = await snarkjs.groth16.fullProve(_proof, wasm, zkey);
        // const rawCallData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
        // const jsonCallData = JSON.parse("[" + rawCallData + "]")

        // // send onchain
        // middleware.verifyProof_DepositRegister(
        //     jsonCallData[0], jsonCallData[1],
        //     jsonCallData[2], jsonCallData[3],
        //     {
        //         from: coordinatorWallet.address,
        //         value: 0,
        //         gasLimit: 500000
        //     });
    });
    return app;
}) 