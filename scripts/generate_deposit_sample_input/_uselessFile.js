const buildMimc7 = require("circomlibjs").buildMimc7;
const { randomBytes, toUtf8Bytes } = require("ethers");
const secp256k1 = require("secp256k1")
const fs = require("fs");
const { bigIntNumTo64BitsArray, bigIntToUint8Array, bigIntToUint8Array32, uint8ArrayToBigInt, ZeroPrvKey, ZeroPubKeyX, ZeroPubKeyY } = require("./utils.js")
const bigInt = require("snarkjs").bigInt;
const Account = require("./account.js");
const Transaction = require("./transaction.js")
const { ethers } = require("ethers");
const { log } = require("console");

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
    
    // const pp = randomBytes(32);
    // const prevkey = uint8ArrayToBigInt(pp).toString(16);
    // const pubkey = secp256k1.publicKeyCreate(pp, false);
    // console.log(pubkey);
    // const _pub = uint8ArrayToBigInt(pubkey).toString(16);
    // console.log("secp256k1:\npubkey: 0x0", _pub);
    
    // const wallet = new ethers.Wallet(prevkey)
    // const pubk = wallet.signingKey.publicKey;
    // console.log("ethers: \npubkey: ", pubk);

    // const msgArr = randomBytes(32);
    // const msgHex = uint8ArrayToBigInt(msgArr).toString(16);
    // console.log("msghash: ", msgHex);

    // const secpSign = secp256k1.ecdsaSign(msgArr, pp);
    // const _pk = bigIntToUint8Array(bigInt(pubk, 16));
    // // console.log(_pk);
    // console.log(secp256k1.ecdsaVerify(secpSign.signature, msgArr, _pk));
    // const etheSign = await wallet.signMessage(msgHex);
    // console.log("secp256k1:\nsignature: ", uint8ArrayToBigInt(secpSign).toString(16));
    // console.log("ethers: \nsignature: ", etheSign);
    
    const msghash = mimc.multiHash([1, 2]);
    const A = createUser();
    const signature = secp256k1.ecdsaSign(msghash, A.prvkey).signature;
    console.log("signature: ", signature);

    const r = uint8ArrayToBigInt(signature.slice(0, 32));
    const s = uint8ArrayToBigInt(signature.slice(32));
    const px = uint8ArrayToBigInt(A.pubkeyX);
    const py = uint8ArrayToBigInt(A.pubkeyY);
    const _msghash = uint8ArrayToBigInt(msghash);

    const input = {
        "r": bigIntNumTo64BitsArray(r),
        "s": bigIntNumTo64BitsArray(s),
        "msghash": bigIntNumTo64BitsArray(_msghash),
        "pubkey": [
            bigIntNumTo64BitsArray(px), bigIntNumTo64BitsArray(py)
        ]
    }
    console.log("input: ");
    console.log(JSON.stringify(input));

    fs.writeFileSync("../../build/inputs/test.json", JSON.stringify(input), "utf-8");
}

run();