const { ethers } = require("ethers");
const ganache = require("ganache");
const snarkjs = require("snarkjs");
const buildMimc7 = require("circomlibjs").buildMimc7;
const Middleware = require("../../build/contracts/Middleware.json");
const { ZeroPubKeyX, ZeroPubKeyY } = require("../generate_deposit_sample_input/utils.js");
const Transaction = require("../generate_deposit_sample_input/transaction.js");
const AccountTree = require("../generate_deposit_sample_input/accountTree.js");
const Account = require("../generate_deposit_sample_input/account.js");
const TxTree = require("../generate_deposit_sample_input/txTree.js");
const DepositTree = require("../generate_deposit_sample_input/depositTree.js");
const {
    getDepositRegisterInputCircuit,
    createUser,
    uint8Array2Hex,
    hex2Uint8Array
} = require("../generate_deposit_sample_input/utils.js");

const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');
const multer = require('multer');
const upload = multer();
const app = express();


// ref: https://stackoverflow.com/questions/41364072/running-an-async-function-before-express-js-start
async function InitState() {
    const options = {
        wallet: {
            totalAccounts: "10",
            accountKeysPath: "build/ganacheAccounts/accounts.json",
            defaultBalance: "10000"
        }
    }
    const ganacheProvider = ganache.provider(options);
    const Provider = new ethers.providers.Web3Provider(ganacheProvider);
    const { createCode, abi } = await import("../../node_modules/circomlibjs/src/mimc7_gencontract.js");
    const mimcjs = await buildMimc7();

    // account tree
    const Zero = new Account(0, ZeroPubKeyX, ZeroPubKeyY, 0, 0, mimcjs);
    const accountTree = new AccountTree(new Array(8).fill(Zero), mimcjs);

    // deploy smart contract 
    const deployer = Provider.getSigner(0);
    const C = new ethers.ContractFactory(abi, createCode("mimc", 91), deployer);
    const mimc = await C.deploy();
    await mimc.deployTransaction.wait();
    const M = new ethers.ContractFactory(Middleware.abi, Middleware.bytecode, deployer);
    const middleware = await M.deploy(mimc.address, accountTree.root);
    await middleware.deployTransaction.wait();

    return {
        accountTree: accountTree,
        provider: Provider,
        mimcjs: mimcjs,
        middleware: middleware
    };
}

exports.appPromise = InitState().then(function ({ accountTree, provider, mimcjs, middleware }) {

    // get account list
    const _accounts = require("../../build/ganacheAccounts/accounts.json");
    const addresses = Object.keys(_accounts.addresses);
    const privateKeys = Object.values(_accounts.private_keys);

    const coordinator = createUser(privateKeys[0]).address;
    accountTree._d_print();
    let depositRegisterTxs = [];

    // let address1wallet = createUser(privateKeys[1]);
    // console.log("address1wallet.publickey: ", address1wallet.publicKey);
    // address1wallet = createUser(privateKeys[2]);
    // console.log("address1wallet.publickey: ", address1wallet.publicKey);
    // address1wallet = createUser(privateKeys[3]);
    // console.log("address1wallet.publickey: ", address1wallet.publicKey);
    // address1wallet = createUser(privateKeys[4]);
    // console.log("address1wallet.publickey: ", address1wallet.publicKey);
    // address1wallet = createUser(privateKeys[5]);
    // console.log("address1wallet.publickey: ", address1wallet.publicKey);

    // listeners
    middleware.on(
        "eDepositRegister(bytes32,bytes32,bytes32,bytes32,uint,bytes32,bytes32,uint8)",
        (fromX, fromY, toX, toY, amount, r, s, v) => {
            console.log("[DEPOSIT SUCCESSFULLY]");
            const newTx = new Transaction(
                hex2Uint8Array(fromX, 16), hex2Uint8Array(fromY, 16),
                hex2Uint8Array(toX, 16), hex2Uint8Array(toY, 16),
                hex2Uint8Array("0"), hex2Uint8Array(amount.toString()),
                hex2Uint8Array(r), hex2Uint8Array(s), parseInt(v), mimcjs
            );
            depositRegisterTxs.push(newTx);
        })
    middleware.on("dDebug(bool)", (x) => console.log("dDebug(bool): ", x))
    middleware.on("dGetUint(uint)", (x) => console.log("dGetUint(uint)): ", x));
    middleware.on("dGetBytes32(bytes32)", (x) => console.log("dGetBytes32(bytes32):\n", x));
    middleware.on("dGetAddress(address)", (add) => console.log("dGetAddress(address):", add));
    middleware.on("dGetBytes32Array(bytes32[])", (arr) => { });

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


    function login(address, privateKey, fn) {
        for (let i = 0; i < addresses.length; ++i)
            if (addresses[i] == address) {
                if (privateKeys[i] == privateKey)
                    return fn(null, createUser(privateKey));
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
            address: req.session.user.address,
            privateKey: req.session.user.privateKey,
            coordinator: coordinator
        });
    })
    app.post('/main', restrict, function (req, res) {
        const fromX = req.session.user.publicKeyX;
        const fromY = req.session.user.publicKeyY;
        const toX = "0x" + req.body.toPublicKey.slice(4, 68);
        const toY = "0x" + req.body.toPublicKey.slice(68);
        const amount = req.body.amount;
        const tx = new Transaction(
            mimcjs.F.e(fromX, 16), mimcjs.F.e(fromY, 16),
            mimcjs.F.e(toX, 16), mimcjs.F.e(toY, 16),
            mimcjs.F.e("0"), mimcjs.F.e(amount.toString()), 0, 0, 0, mimcjs);
        tx.signTxHash(hex2Uint8Array(req.session.user.privateKey), mimcjs);
        const r = uint8Array2Hex(tx.r);
        const s = uint8Array2Hex(tx.s);
        const v = tx.v;
        middleware.deposit(fromX, fromY, toX, toY, 0, r, s, v, {
            from: req.session.user.address,
            value: 0,
            gasLimit: 200000
        });
    })

    function isCoordinator(req, res, next) {
        if (req.session.user && req.session.user.address == coordinator) {
            next();
        } else {
            req.session.error = 'Access denied!';
            res.redirect('back');
        }
    }
    app.post('/main_process_deposit_register', isCoordinator, async function (req, res) {
        console.log("process deposit register button is trigger");
        res.send("process deposit register button is trigger");

        const noTx = 2 ** Math.floor(Math.log2(depositRegisterTxs.length));
        console.log("noTx: ", noTx);
        const txs = depositRegisterTxs.slice(0, noTx);
        depositRegisterTxs = depositRegisterTxs.slice(noTx);

        const depositRegisterTxTree = new TxTree(txs, mimcjs);
        const state = accountTree.processDepositRegisterTxTree(depositRegisterTxTree, mimcjs);
        // console.log("state.depositRoot: ", state.depositRoot);
        // const _proof = getDepositRegisterInputCircuit(state, mimcjs);
        // const path2wasmFile = "build/circuits/deposit_register_verifier/deposit_register_verifier_js/deposit_register_verifier.wasm";
        // const path2zkeyFile = "build/circuits/deposit_register_verifier/deposit_register_verifier_1.zkey"
        // const { proof, publicSignals } = await snarkjs.groth16.fullProve(_proof, path2wasmFile, path2zkeyFile);
    })

    app.post("/debug", function (req, res) {
        req.session.user = createUser(privateKeys[0]);
        // req.session.user = createUser("0xc87b58d7332676f95c01c1e75a91243b1f65a864f599c4c4a440d19f070f050a");
        // console.log("req.session.user.privateKey: ", req.session.user.privateKey);
        const fromX = req.session.user.publicKeyX;
        const fromY = req.session.user.publicKeyY;
        for (let i = 0; i < 5; ++i) {
            const user = createUser(privateKeys[i + 1]);
            const toX = user.publicKeyX;
            const toY = user.publicKeyY;
            const amount = 0;
            const tx = new Transaction(
                hex2Uint8Array(fromX), hex2Uint8Array(fromY),
                hex2Uint8Array(toX), hex2Uint8Array(toY),
                hex2Uint8Array("0"), hex2Uint8Array(amount.toString()), 0, 0, 0, mimcjs);

            tx.signTxHash(hex2Uint8Array(req.session.user.privateKey), mimcjs);
            const r = uint8Array2Hex(tx.r);
            const s = uint8Array2Hex(tx.s);
            const v = tx.v;
            middleware.deposit(fromX, fromY, toX, toY, 0, r, s, v, {
                from: req.session.user.address,
                value: 0,
                gasLimit: 300000
            });
        }
        res.redirect("/login");
    })
    app.post("/debug_process", async function (req, res) {
        const noTx = 2 ** Math.floor(Math.log2(depositRegisterTxs.length));
        console.log("noTx: ", noTx);
        const txs = depositRegisterTxs.slice(0, noTx);
        depositRegisterTxs = depositRegisterTxs.slice(noTx);

        const depositRegisterTxTree = new TxTree(txs, mimcjs);
        const state = accountTree.processDepositRegisterTxTree(depositRegisterTxTree, mimcjs);
        const _proof = getDepositRegisterInputCircuit(state, mimcjs);
        console.log(_proof);

        // const path2wasmFile = "build/circuits/deposit_register_verifier/deposit_register_verifier_js/deposit_register_verifier.wasm";
        // const path2zkeyFile = "build/circuits/deposit_register_verifier/deposit_register_verifier_1.zkey"
        // const { proof, publicSignals } = await snarkjs.groth16.fullProve(_proof, path2wasmFile, path2zkeyFile);
        // const rawCallData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
        // const jsonCallData = JSON.parse("[" + rawCallData + "]")
        // console.log(jsonCallData);

        // middleware.verifyProof_DepositRegister(
        //     jsonCallData[0], jsonCallData[1],
        //     jsonCallData[2], jsonCallData[3],
        //     {
        //         from: coordinator.address,
        //         value: 0,
        //         gasLimit: 200000
        //     });

        // console.log("_proof.oldAccountRoot_Onchain: ", _proof.oldAccountRoot_Onchain);
        // console.log("_proof.depositRegisterRoot_Onchain: ", _proof.depositRegisterRoot_Onchain);
    })
    return app;
}) 