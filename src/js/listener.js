import Deposit from "./deposit.js"

const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));

// check connection
if (web3.eth.net.isListening()) {
    console.log("Connected: true");
}
else {
    console.log("Connected: false");
}

// get smart contract
const abi = require("./_abi.json");
const smart_contract_address = require("./_smart_contract_address.json");
var middleware = new web3.eth.Contract(abi, smart_contract_address);

var deposit_tx = []
var deposit_pending_tx = []

// EVENTS
middleware.events._e_deposit_register_root_change(function (err, res) {
})

middleware.events._e_process_deposit_tx(function (err, res) {

})

middleware.events._e_deposit_register(function (err, res) {
    if (err) {
        console.log(err);
    }
    else {
        deposit_pending_tx.push(new Deposit(
            res.returnValues._from,
            res.returnValues._to,
            res.returnValues._amount,
        ))
    }
});

middleware.events._e_deposit_existence(function (err, res) {
    if (err) {
        console.log(err);
    }
    else {
        deposit_pending_tx.push(new Deposit(
            res.returnValues._from,
            res.returnValues._to,
            res.returnValues._amount,
        ))
    }
});
