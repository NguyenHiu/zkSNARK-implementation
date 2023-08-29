const express = require('express');
const { ethers } = require("ethers");
const ganache = require("ganache");
const path = require('path');
const buildMimc7 = require("circomlibjs").buildMimc7;
const Middleware = require("../../build/contracts/Middleware.json");
const bigInt = require("snarkjs").bigInt;
const { randomBytes, concat, toUtf8Bytes, verifyMessage, parseUnits } = require('ethers/lib/utils');
const Transaction = require("../generate_deposit_sample_input/transaction.js");
const secp256k1 = require('secp256k1');

const app = express();
// const provider = new ethers.providers.JsonRpcProvider(); // (i.e. ``http:/\/localhost:8545``)
// const ganacheProvider = ganache.provider({wallet: {accounts: "0x0000000000000000000000000000000000000000000000000000000000000001,10000000000000000000000"}});

// const Provider = new ethers.providers.JsonRpcProvider(); //new ethers.providers.Web3Provider(ganacheProvider);
// console.log(Provider.getBalance));

function createUser(prvkey) {
    const user = new ethers.Wallet(prvkey);
    const pubkX = "0x" + user.publicKey.slice(4, 68);
    const pubkY = "0x" + user.publicKey.slice(68);
    const obj = {
        wallet: user,
        publicKeyX: pubkX,
        publicKeyY: pubkY
    }
    return obj; 
}

function hex2Uint8Array(hex, l = 32) {
    const arr = [];
    if ((hex.length > 2) && (hex.slice(0, 2) == "0x")) {
        hex = hex.slice(2);
    }
    hex.match(/.{1,2}/g).map(x => arr.push(parseInt(x, 16)));
    while (arr.length < l)
        arr.push(0);
    return new Uint8Array(arr);
}

function uint8Array2Hex(uint8array, l = -1) {
    let hex = "";
    for (let i = 0; i < uint8array.length; ++i) {
        hex += uint8array[i].toString(16).padStart(2, "0");
    }
    if (l != -1)
        hex.padStart(l, "0");
    return "0x" + hex;
}

app.use(async function (req, res, next) {
    const options = {
        wallet: {
            totalAccounts: "10",
            accountKeysPath: "build/ganacheAccounts/accounts.json",
            defaultBalance: "10000"
        }
    }
    const ganacheProvider = ganache.provider(options);
    const Provider = new ethers.providers.Web3Provider(ganacheProvider);

    res.send("ZKP")
    const { createCode, abi } = await import("../../node_modules/circomlibjs/src/mimc7_gencontract.js");

    const mimcjs = await buildMimc7();

    // deploy mimc smart contract 
    const deployer = Provider.getSigner(0);
    const C = new ethers.ContractFactory(abi, createCode("mimc", 91), deployer);
    const mimc = await C.deploy();
    const M = new ethers.ContractFactory(Middleware.abi, Middleware.bytecode, deployer);
    const middleware = await M.deploy(mimc.address);
    await middleware.deployTransaction.wait();

    // deposit register 
    const depositRegisterTxs = [];
    let depositRegisterRoot;

    // listeners
    middleware.on(
        "eDepositRegister(bytes32,bytes32,uint,bytes32,bytes32)",
        (toX, toY, amount, r, s) => {
           console.log("eDepositRegister(bytes32,bytes32,uint,bytes32,bytes32)");
        })

    middleware.on("dDebug(bool)", (x) => console.log("dDebug(bool): ", x))
    middleware.on("dGetUint(uint)", (x) => console.log("dGetUint(uint)): ", x));
    middleware.on("dGetBytes32(bytes32)", (x) => console.log("dGetBytes32(bytes32):\n", x));
    middleware.on("dGetAddress(address)", (add) => console.log("dGetAddress(address):", add));
    middleware.on("dGetBytes32Array(bytes32[])", (arr) => {
        console.log("[sol] tx.hash: ", arr[0]);
        console.log("[sol] r: ", arr[1]);
        console.log("[sol] s: ", arr[2]);
        console.log("[sol] v: ", arr[3]);
    });

    // get account list
    const _accounts = require("../../build/ganacheAccounts/accounts.json");
    const addresses = Object.keys(_accounts.addresses);
    const privateKeys = Object.values(_accounts.private_keys);

    const from = createUser(privateKeys[0]);
    const to = createUser(privateKeys[1]);

    const tx = new Transaction(
        mimcjs.F.e(from.publicKeyX, 16), mimcjs.F.e(from.publicKeyY, 16),
        mimcjs.F.e(to.publicKeyX, 16), mimcjs.F.e(to.publicKeyY, 16),
        mimcjs.F.e(0), mimcjs.F.e(0), 0, 0, 0, mimcjs);
    console.log("[UINT8ARRAY] prvkey: ", hex2Uint8Array(from.wallet.privateKey));
    console.log("[HEX] prvkey: ", from.wallet.privateKey);
    tx.signTxHash(hex2Uint8Array(from.wallet.privateKey), mimcjs);

    const r = uint8Array2Hex(tx.r);
    const s = uint8Array2Hex(tx.s);
    const v = tx.v;

    console.log("[js] tx.hash: ", "0x" + mimcjs.F.toString(tx.hash, 16).padStart(32, "0"));
    console.log("[js] tx.hash: ", mimcjs.F.toString(tx.hash, 16)); 
    console.log("[js] r: ", r);
    console.log("[js] s: ", s);
    console.log("[js] v: ", v);
    middleware.deposit(from.publicKeyX, from.publicKeyY, to.publicKeyX, to.publicKeyY, 0, r, s, v, {
        from: from.wallet.address,
        value: 0,
        gasLimit: 200000
    });
    console.log("from.address: ", from.wallet.address);
    // console.log("to.address: ", to.wallet.address);

});

module.exports = app;   