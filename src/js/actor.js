const Web3 = require("web3");
const abi = require("./_abi.json");
const smart_contract_address = require("./_smart_contract_address.json");

var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));

if (web3.eth.net.isListening()) {
    console.log("true");
}
else {
    console.log("false");
}

var middleware = new web3.eth.Contract(abi, smart_contract_address);

var address_1 = '0x081FaFF25697dE918aE94f25672fAaD45b3274e2';
var address_2 = '0x669BD1F82711fd41794D865E5c1274232C720752';

// middleware.methods._deposit(address_1, 20).send(
//     {
//         from: address_1,
//         value: 2000000000000000000,
//         gas: 200000

//     }
//     , function (err, res) {
//         console.log("err: " + err);
//         console.log("res: " + res);
//     })

// middleware.methods._deposit(address_2, 20).send(
//     {
//         from: address_2,
//         value: 2000000000000000000,
//         gas: 200000

//     }
//     , function (err, res) {
//         console.log("err: " + err);
//         console.log("res: " + res);
//     })

// middleware.methods._deposit(address_2, 20).send(
//     {
//         from: address_2,
//         value: 2000000000000000000,
//         gas: 200000

//     }
//     , function (err, res) {
//         console.log("err: " + err);
//         console.log("res: " + res);
//     })

middleware.methods._process_deposit().send(
    { from: address_2 }, function (err, res) {
        console.log("err: " + err);
        console.log("res: " + res);
    });
