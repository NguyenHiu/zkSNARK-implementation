const Web3 = require("web3");
const abi = require("./_abi.json");
const Deposit = require("./deposit");
const Merkle_Tree = require("./merkle_tree.js")
const smart_contract_address = require("./_smart_contract_address.json");

var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));

// check connection
if (web3.eth.net.isListening()) {
    console.log("Connected: true");
}
else {
    console.log("Connected: false");
}

// get smart contract
var middleware = new web3.eth.Contract(abi, smart_contract_address);

var deposit_tx = []
var deposit_pending_tx = []
var merkle_tree = new Merkle_Tree(8)

// EVENTS
middleware.events._e_process_deposit_tx(function (err, res) {
    if (err) {
        console.log(err);
    }
    else {

    }
})

middleware.events._e_deposit_register_root_change(function (err, res) {
    if (err) {
        console.log(err);
    }
    else {
        // verify deposit register root
        var new_root = res.returnValues.new_root;
        var n = res.returnValues.n;


    }
})

middleware.events._e_deposit_existence_root_change(function (err, res) {
    if (err) {
        console.log(err);
    }
    else {
        // verify deposit existence root
        var new_root = res.returnValues.new_root;
        console.log("new root: ", new_root);
    }
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
