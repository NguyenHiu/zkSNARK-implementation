const { ZeroPubKeyX, ZeroPubKeyY, ZeroPrvKey, Empty, isEqual, uint8ArrayToBigInt } = require("./utils.js");
const circomlibjs = require("circomlibjs");
const { randomBytes } = require("ethers");
const bigInt = require("snarkjs").bigInt;
const secp256k1 = require("secp256k1");
const fs = require("fs");
const DepositTree = require("./depositTree.js");
const AccountTree = require("./accountTree.js");
const Account = require("./account.js");
const TxTree = require("./txTree.js");
const Transaction = require("./transaction.js");

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

    /* DEPOSIT REGISTER */
    const Zero = new Account(0, ZeroPubKeyX, ZeroPubKeyY, 0, 0, mimc);
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

    const depositRegisterProof = accountTree.processTxTreeDepositRegister(depositTree, mimc);
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

    /* DEPOSIT EXISTENCE */
    // const depositExistenceTxs = [];
    // const tx1 = new Transaction(ZeroPubKeyX, ZeroPubKeyY, Alice.pubkeyX, Alice.pubkeyY, 0, 100, 0, 0, 0, mimc);
    // tx1.signTxHash(ZeroPrvKey);
    // depositExistenceTxs.push(tx1)

    // const tx2 = new Transaction(ZeroPubKeyX, ZeroPubKeyY, Bob.pubkeyX, Bob.pubkeyY, 1, 100, 0, 0, 0, mimc);
    // tx2.signTxHash(ZeroPrvKey);
    // depositExistenceTxs.push(tx2)

    // const tx3 = new Transaction(ZeroPubKeyX, ZeroPubKeyY, Eva.pubkeyX, Eva.pubkeyY, 2, 100, 0, 0, 0, mimc);
    // tx3.signTxHash(ZeroPrvKey);
    // depositExistenceTxs.push(tx3)
       
    // const tx4 = new Transaction(ZeroPubKeyX, ZeroPubKeyY, Eva.pubkeyX, Eva.pubkeyY, 2, 100, 0, 0, 0, mimc);
    // tx4.signTxHash(ZeroPrvKey);
    // depositExistenceTxs.push(tx4)
    
    // const depositExistenceTree = new TxTree(depositExistenceTxs, mimc);
    // console.log(depositExistenceTree._d_checkValidTree(mimc));
    
    // const proof = accountTree.processTxTree(depositExistenceTree, mimc);
    // console.log(depositExistenceTree._d_checkValidTree(mimc));
    // console.log(proof);

}

run();