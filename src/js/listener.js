const Web3 = require("web3");
const DEPOSIT = require("./modules/deposit");
const { MERKLE_TREE, MERKLE_TREE_NIL } = require("./modules/_new_merkle_tree");
const NODE = require("./modules/node");
const abi = require("./_abi.json");
const smart_contract_address = require("./_smart_contract_address.json");

let web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:8545"));

// check connection
if (web3.eth.net.isListening()) {
    console.log("Connected: true");
}
else {
    console.log("Connected: false");
}

// get smart contract
let middleware = new web3.eth.Contract(abi, smart_contract_address);

let deposit_tx = []
let deposit_pending_tx_register = []
let deposit_pending_tx_existence = []
let Account_Tree = new MERKLE_TREE_NIL(8);

let address_1 = "0xA5F352C55Ab104cE9a0Bf2Ecb3F723e6ce8922c8";

// EVENTS
middleware.events._e_valid_proof(function () {
    console.log("VALID PROOF");
})

middleware.events._e_invalid_proof(function () {
    console.log("INVALID PROOF");
})

middleware.events._e_process_deposit_register(function (err, res) {
    console.log('[Process Deposit]');
    if (err) {
        console.log("err: " + err);
    }
    else {
        let smart_contract_register_root = res.returnValues.deposit_register_root;

        // 1. Check valid root
        let merkle_register = new MERKLE_TREE(deposit_pending_tx_register);
        if (merkle_register.root.hash_value != smart_contract_register_root) {
            console.log("register-roots are different!");
            console.log("be-root: " + merkle_register.root.hash_value);
            console.log("smart-contract-root: " + smart_contract_register_root);
            return;
        }
        else {
            console.log("register-roots are the same!");
        }


        let DR_Proofs = [];
        let DR_Path = [];
        let DR_intermediate_acc_root;



        // 2. Adding
        // 2.1. (Register) Find sub-tree
        console.log("... Register ... ");
        if (deposit_pending_tx_register.length > 0) {
            let height = Math.floor(Math.log2(deposit_pending_tx_register.length));
            let empty_tree = Account_Tree.find_empty_tree(height);

            if (empty_tree.proof == null) {
                console.log("Account Tree does not have enough space for Deposit Register Tree");
                return;
            }

            Account_Tree.add_subtree_according_path(
                merkle_register.root,
                merkle_register.leaves_in4,
                empty_tree.path);

            DR_Proofs = empty_tree.proof;
            DR_Path = empty_tree.path;
            DR_intermediate_acc_root = Account_Tree.root.hash_value;
        }

        middleware.methods._verify_process_deposit_register(
            DR_Proofs, DR_Path, DR_intermediate_acc_root).send(
                {
                    from: address_1,
                    value: 0,
                    gas: 200000

                }
                , function (err, res) {
                    console.log("err: " + err);
                    console.log("res: " + res);
                });
    }
})

middleware.events._e_process_deposit_existence(function (err, res) {
    console.log('[Process Deposit]');
    if (err) {
        console.log("err: " + err);
    }
    else {
        let smart_contract_existence_root = res.returnValues.deposit_existence_root;
        let merkle_existence = new MERKLE_TREE(deposit_pending_tx_existence);

        if (merkle_existence.root.hash_value != smart_contract_existence_root) {
            console.log("existence-roots are different!");
            console.log("be-root: " + merkle_existence.root.hash_value);
            console.log("smart-contract-root: " + smart_contract_existence_root);
            return;
        }
        else {
            console.log("existence-roots are the same!");
        }


        let from = [];
        let to = [];
        let current_balance = [];
        let deposit_amount = [];
        let DE_Proofs_TX = [];
        let DE_Path_TX = [];
        let DE_Proofs = [];
        let DE_Path = [];
        let DE_intermediate_acc_root = [];

        console.log("... Existence ... ");
        // 2.2. (Existence) Add
        if (deposit_pending_tx_existence.length > 0) {
            for (let i = 0; i < deposit_pending_tx_existence.length; ++i) {
                from.push(deposit_pending_tx_existence[i]._from);
                to.push(deposit_pending_tx_existence[i]._to);
                deposit_amount.push(deposit_pending_tx_existence[i]._amount);

                let tmp = merkle_existence.get_merkle_proof_leaf(deposit_pending_tx_existence[i]);
                DE_Proofs_TX.push(tmp.proof);
                DE_Path_TX.push(tmp.path);

                let node = Account_Tree.leaves_in4[Account_Tree.has_address(deposit_pending_tx_existence[i]._to)];
                let to_proof = Account_Tree.get_merkle_proof_leaf(node);
                current_balance.push(node._amount);
                DE_Proofs.push(to_proof.proof);
                DE_Path.push(to_proof.path);

                Account_Tree.add_subtree_according_path(new NODE(null, null, null,
                    web3.utils.soliditySha3(
                        { type: 'address', value: node._from },
                        { type: 'address', value: node._to },
                        { type: 'uint', value: (parseInt(current_balance) + parseInt(deposit_amount)) },
                    )), [new DEPOSIT(node._from, node._to, (parseInt(current_balance) + parseInt(deposit_amount)))],
                    to_proof.path);

                DE_intermediate_acc_root.push(Account_Tree.root.hash_value);

            }
            middleware.methods._verify_process_deposit_existence(
                from, to, current_balance, deposit_amount, DE_Proofs_TX, DE_Path_TX, DE_Proofs, DE_Path, DE_intermediate_acc_root
            ).send(
                {
                    from: address_1,
                    value: 0,
                    gas: 200000

                }
                , function (err, res) {
                    console.log("err: " + err);
                    console.log("res: " + res);
                });
        }
    }
})

middleware.events._e_tracking(function (err, res) {
    console.log(res.returnValues.text + ": ");
    console.log(res.returnValues._value);
})

middleware.events._e_tracking_num(function (err, res) {
    console.log(res.returnValues.text + ": ");
    console.log(res.returnValues.num);
})

middleware.events._e_tracking_addr(function (err, res) {
    console.log(res.returnValues.text + ": ");
    console.log(res.returnValues.addr);
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
        // if (Math.floor(Math.log2(deposit_pending_tx_existence.length)) == Math.log2(deposit_pending_tx_existence.length)) {
        //     tree = new MERKLE_TREE(deposit_pending_tx_existence);
        //     console.log("BE deposit existence root:");
        //     console.log(tree.root.hash_value);
        // }
    }
});
