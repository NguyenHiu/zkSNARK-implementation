const secp256k1 = require("secp256k1");
const Account = require("./account.js");
const Transaction = require("./transaction.js");
const TxTree = require("./txTree.js");
const DepositTree = require("./depositTree.js");
const { randomBytes } = require("ethers");
const circomlibjs = require("circomlibjs");
const { ZeroPrvKey, Empty, isEqual } = require("./utils.js");
const AccountTree = require("./accountTree.js");

function createUser() {
    const prvkey = randomBytes(32);
    const pubkey = secp256k1.publicKeyCreate(prvkey, false);
    return {
        prvkey: prvkey,
        pubkeyX: pubkey.slice(1, 33),
        pubkeyY: pubkey.slice(33)
    };
}

async function run() {
    const mimc = await circomlibjs.buildMimc7();

    // Dang code!

    // // const Zeoro
    // const Zero = new Account(0, new Uint8Array(new Array(32).fill(0)), new Uint8Array(new Array(32).fill(0)), 0, 0, mimc);
    // const Alice = new Account(1, new)

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