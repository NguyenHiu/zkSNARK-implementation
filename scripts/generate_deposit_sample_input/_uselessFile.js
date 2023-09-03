const buildMimc7 = require("circomlibjs").buildMimc7;
const { randomBytes } = require("ethers");
const secp256k1 = require("secp256k1")
const Transaction = require("./transaction.js");
const AccountTree = require("./accountTree.js");
const Account = require("./account.js");

async function run() {
    const mimc = await buildMimc7();

    let zr = new Uint8Array(new Array(32).fill(0));
    const accs = [];
    for (let i = 0; i < 8; ++i) {
        accs.push(new Account(i, zr, zr, 0, 0, mimc));
    }
    const accTree = new AccountTree(accs, mimc);
    accTree._d_print();

    let newAddr = new Uint8Array(new Array(32).fill(1));
    const newAccs = [];
    for (let i = 0; i < 4; ++i) {
        newAccs.push(new Account(i, newAddr, newAddr, 0, 0, mimc));
    }
    const newTree = new AccountTree(newAccs, mimc);
    accTree.updateSubTree(newTree, 1, 0);
    accTree._d_print();
}

run();