const bigInt = require("snarkjs").bigInt;
const secp256k1 = require("secp256k1");
const Account = require("./account.js");
const Transaction = require("./transaction.js");
const TxTree = require("./txTree.js");
const DepositTree = require("./depositTree.js");
const { randomBytes } = require("ethers");
const circomlibjs = require("circomlibjs");
const { ZeroPubKeyX, ZeroPubKeyY, ZeroPrvKey, Empty, isEqual, uint8ArrayToBigInt } = require("./utils.js");
const AccountTree = require("./accountTree.js");
const fs = require("fs");
const {stringifyBigInts} = require("./stringifybigint.js");

function createUser() {
    const prvkey = randomBytes(32);
    const pubkey = secp256k1.publicKeyCreate(prvkey, false);
    return {
        prvkey: prvkey,
        pubkeyX: pubkey.slice(1, 33),
        pubkeyY: pubkey.slice(33)
    };
}

function convert(x) {
    let s = bigInt(0);
    for (let i = 0; i < x.length; ++i) {
        s = bigInt.add(bigInt.mul(s, bigInt(256)), bigInt(x[i]));
    }
    return s;
}

async function run() {
    const mimc = await circomlibjs.buildMimc7();

    // console.log(mimc.F.toString(mimc.multiHash([BigInt(44197704158317907713192630833793885820470319960428659112617039771932448693504), BigInt(44197704158317907713192630833793885820470319960428659112617039771932448693504)])));

    const Zero = new Account(0, ZeroPubKeyX, ZeroPubKeyY, 0, 0, mimc);
    const res = []
    let x = Zero.hash
    for (let i = 0; i < 10; ++i) {
        res.push(mimc.F.toString(x));
        x = mimc.multiHash([x, x]);
    }
    console.log(res);


    const _Alice = createUser();
    const Alice = new Account(1, _Alice.pubkeyX, _Alice.pubkeyY, 100, 0, mimc);
    const _Bob = createUser();
    const Bob = new Account(2, _Bob.pubkeyX, _Bob.pubkeyY, 100, 0, mimc);
    const _Eva = createUser();
    const Eva = new Account(3, _Eva.pubkeyX, _Eva.pubkeyY, 100, 0, mimc);
    const accounts = [Zero, Alice, Bob, Eva];

    const depositTree = new DepositTree(accounts, mimc);

    const accountTree = new AccountTree(new Array(8).fill(Zero), mimc);
    console.log("check: ", accountTree._d_checkValidTree(mimc));
    const oldAccountRoot = accountTree.root;
    console.log("oldAccountRoot: ", mimc.F.toString(oldAccountRoot));

    const depositRegisterProof = accountTree.processTxTreeDepositRegister(depositTree, mimc);
    console.log(mimc.F.toString(depositRegisterProof.newAccountRoot));
    console.log("check: ", accountTree._d_checkValidTree(mimc));

    const input = {
        "depositRegisterOnchainRoot": mimc.F.toString(depositTree.root),
        "depositRegisterRoot": mimc.F.toString(depositTree.root),
        "oldAccountRoot": mimc.F.toString(oldAccountRoot),
        "proof": uint8ArrayToBigInt(depositRegisterProof.proof, mimc),
        "proofPos": depositRegisterProof.proofPos,
        "newAccountRoot": mimc.F.toString(depositRegisterProof.newAccountRoot),
    }

    fs.writeFileSync(
        "../../build/inputs/1_test_deposit_register_proof.json",
        JSON.stringify(input),
        "utf-8"
    );

    // // 

    // const accountTree = new AccountTree(new Array(8).fill(Zero), mimc);
    // accountTree._d_print();
    // accountTree.processTxTreeDepositRegister(txTree, mimc);
    // accountTree._d_print()

    // const prvkey = new Uint8Array(new Array(32).fill(0));
    // console.log(prvkey);
    // const pubkey = secp256k1.publicKeyCreate(prvkey, false);
    // console.log(pubkey);
}

run();