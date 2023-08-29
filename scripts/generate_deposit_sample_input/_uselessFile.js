const buildMimc7 = require("circomlibjs").buildMimc7;
const { randomBytes } = require("ethers");
const secp256k1 = require("secp256k1")
const { hexToUint8Array, uint8ArrayToHex } = require("./utils.js")
const bigInt = require("snarkjs").bigInt;
const Transaction = require("./transaction.js")

function createUser() {
    const prvkey = randomBytes(32);
    const pubkey = secp256k1.publicKeyCreate(prvkey, false);
    return {
        prvkey: prvkey,
        pubkey: pubkey,
        pubkeyX: pubkey.slice(1, 33),
        pubkeyY: pubkey.slice(33),
    };
}

async function run() {
    const mimc = await buildMimc7();
    console.log(uint8ArrayToHex(mimc.multiHash([hexToUint8Array("0x0")])));
    // const toX = "0x6101c2fc15c6564457956fed37b9bd81b529cc107eb2ee2a3c0b23e8f64d2772";
    // const toY = "0x1ecb7327a94dc7af00fd40081eeb0c818983d8cf0e448b21c6fd8fc902f710ef"; 
    // const tx = new Transaction(
    //     hexToUint8Array("0x0"),
    //     hexToUint8Array("0x0"),
    //     hexToUint8Array(toX),
    //     hexToUint8Array(toY),
    //     hexToUint8Array("0x0"),
    //     hexToUint8Array("0x0"),
    //     0, 0, 0, mimc
    // )

    // console.log("tx.hash: \n", uint8ArrayToHex(tx.hash));

    // const Alice = createUser();
    // const tx = new Transaction(Alice.pubkeyX, Alice.pubkeyY, Alice.pubkeyX, Alice.pubkeyY, 0, 100, 0, 0, 0, mimc);
    // tx.signTxHash(Alice.prvkey);
    // const input = {
    //     "r": bigIntNumTo64BitsArray(uint8ArrayToBigInt(tx.r)),
    //     "s": bigIntNumTo64BitsArray(uint8ArrayToBigInt(tx.s)),
    //     "msghash": bigIntNumTo64BitsArray(uint8ArrayToBigInt(tx.hash)),
    //     "pubkey": [
    //         bigIntNumTo64BitsArray(uint8ArrayToBigInt(tx.fromX)),
    //         bigIntNumTo64BitsArray(uint8ArrayToBigInt(tx.fromY)),
    //     ]
    // }
    // console.log("intput: ");
    // console.log(JSON.stringify(input));
}

run();