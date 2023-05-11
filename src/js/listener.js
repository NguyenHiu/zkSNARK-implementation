const Web3 = require("web3");
const DEPOSIT = require("./modules/deposit");
const { MERKLE_TREE, MERKLE_TREE_NIL, NODE } = require("./modules/merkle_tree");
const abi = require("./_abi.json");
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
var deposit_pending_tx_register = []
var deposit_pending_tx_existence = []
var Account_Tree = new MERKLE_TREE_NIL(8);

var address_2 = '0x669BD1F82711fd41794D865E5c1274232C720752';

// EVENTS
middleware.events._e_process_deposit(function (err, res) {
    console.log('[Process Deposit]');
    if (err) {
        console.log("err: " + err);
    }
    else {
        var smart_contract_register_root = res.returnValues.deposit_register_root;
        var smart_contract_existence_root = res.returnValues.deposit_existence_root;

        // 1. Check valid root
        var merkle_register = new MERKLE_TREE(deposit_pending_tx_register);
        console.log("check-point-1");
        var merkle_existence = new MERKLE_TREE(deposit_pending_tx_existence);
        console.log("check-point-2");
        if (merkle_register.root.hash_value != smart_contract_register_root) {
            console.log("register-roots are different!");
            console.log("be-root: " + merkle_register.root.hash_value);
            console.log("smart-contract-root: " + smart_contract_register_root);
            return;
        }
        else {
            console.log("register-roots are the same!");
        }

        if (merkle_existence.root.hash_value != smart_contract_existence_root) {
            console.log("existence-roots are different!");
            console.log("be-root: " + merkle_existence.root.hash_value);
            console.log("smart-contract-root: " + smart_contract_existence_root);
            return;
        }
        else {
            console.log("existence-roots are the same!");
        }

        // 2. Adding
        // 2.1. (Register) Find sub-tree
        if (deposit_pending_tx_register.length > 0) {
            var height = Math.floor(Math.log2(deposit_pending_tx_register.length));
            var empty_tree = Account_Tree.find_empty_tree(height);

            if (empty_tree.proof == null) {
                console.log("Account Tree does not have enough space for Deposit Register Tree");
                return;
            }

            middleware.methods._verify_deposit_register(empty_tree.proof, empty_tree.path, height).send({
                from: address_2
            });

            // add
            middleware.events._e_valid_proof(function (err, res) {
                console.log("[Valid Proof]");
                // Update Account Tree
                // I already have deposit register tree (from verify deposit-register-root)
                // So, the work is only adding this tree into account tree 
                Account_Tree.add_sub_tree_according_path(merkle_register.root, empty_tree.path);
                console.log('after updating: ');
                Account_Tree._print(Account_Tree.root, 0);
            })
        }

        // // 2.2. (Existence) Add
        // if (deposit_pending_tx_existence.length > 0) {

        // }
    }
})

middleware.events._e_tracking(function (err, res) {
    console.log(res.returnValues._value);
})

middleware.events._e_deposit_register(function (err, res) {
    console.log('[Deposit Register]');
    if (err) {
        console.log(err);
    }
    else {
        deposit_pending_tx_register.push(new DEPOSIT(
            res.returnValues._from,
            res.returnValues._to,
            res.returnValues._amount,
        ))
        console.log(deposit_pending_tx_register);
    }
});

middleware.events._e_deposit_existence(function (err, res) {
    console.log('[Deposit Existence]');
    if (err) {
        console.log(err);
    }
    else {
        deposit_pending_tx_existence.push(new DEPOSIT(
            res.returnValues._from,
            res.returnValues._to,
            res.returnValues._amount,
        ))
        console.log(deposit_pending_tx_existence);
    }
});
