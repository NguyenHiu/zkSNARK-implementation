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

var address_1 = '0x17aBC45Ebf50143159988920802868Eb276922Be';
var address_2 = '0xCc087589201E8E042Deea5dB68707256F90A3a4F';

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
