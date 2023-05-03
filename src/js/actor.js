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

var address_1 = '0x425bd793F2888444A87a5a9Db29849D472f5BD15';
var address_2 = '0xA4c349839Dbd94CbCA212C3c01e516a7697198B7';

middleware.methods._deposit(address_1, 20).send(
    {
        from: address_1,
        value: 2000000000000000000,
        gas: 200000

    }
    , function (err, res) {
        console.log("err: " + err);
        console.log("res: " + res);
    })

middleware.methods._deposit(address_2, 20).send(
    {
        from: address_2,
        value: 2000000000000000000,
        gas: 200000

    }
    , function (err, res) {
        console.log("err: " + err);
        console.log("res: " + res);
    })

middleware.methods._deposit(address_2, 20).send(
    {
        from: address_2,
        value: 2000000000000000000,
        gas: 200000

    }
    , function (err, res) {
        console.log("err: " + err);
        console.log("res: " + res);
    })

middleware.methods._process_deposit().send(
    { from: address_2 }, function (err, res) {
        console.log("err: " + err);
        console.log("res: " + res);
    });
