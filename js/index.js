const listOfAccountsL1 = document.getElementById("listOfAccountsL1");
const listOfAccountsL2 = document.getElementById("listOfAccountsL2");
const submitBtn = document.getElementById('submit');
const FROM = document.getElementById('from');
const TO = document.getElementById('to')
const AMOUNT = document.getElementById('amount');
const previousAccountRoot = document.getElementById('previousAccountRoot');
const newestAccountRoot = document.getElementById('newestAccountRoot');
const depositRegisterRootOnchain = document.getElementById('depositRegisterRootOnchain');
const depositRegisterRoot = document.getElementById('depositRegisterRoot');
const depositRegisterTx = document.getElementById('depositRegisterTx');
const depositExistenceRootOnchain = document.getElementById('depositExistenceRootOnchain');
const depositExistenceRoot = document.getElementById('depositExistenceRoot');
const depositExistenceTx = document.getElementById('depositExistenceTx');
const AccountTree = document.getElementById('AccountTree');

previousAccountRoot.innerText = "0";
newestAccountRoot.innerText = "0";
depositRegisterRoot.innerText = "0";
depositRegisterTx.innerText = "[]";
depositExistenceRoot.innerText = "0";
depositExistenceTx.innerText = "[]";
AccountTree.innerText = "0";

// const provider = Ganache.provider();
// const web3 = new Web3(provider);

const provider = new Web3.providers.WebsocketProvider("ws://127.0.0.1:8545")
let web3 = new Web3(provider);

import DEPOSIT from "./modules/deposit.js"
import { MERKLE_TREE, MERKLE_TREE_NIL } from "./modules/_new_merkle_tree.js";
import NODE from "./modules/node.js";
import {Zk_proof} from "./modules/zk_proof.cjs";

import abi from "./json/_abi.json" assert { type: "json" };
import smart_contract_address from "./json/_smart_contract_address.json" assert { type: "json" };

let middleware = new web3.eth.Contract(abi, smart_contract_address);

let deposit_pending_tx_register = []
let deposit_pending_tx_existence = []
let Account_Tree = new MERKLE_TREE_NIL(8);

let accounts = []
let balances = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 };
let strL1 = "";
let strL2 = "";

function updateListOfAccounts() {
    let str1 = "";
    let str2 = "";
    for (let i = 0; i < accounts.length; ++i) {
        if (i < 5) {
            web3.eth.getBalance(accounts[i]).then((res) => {
                str1 += i + ". " + accounts[i] + ", balance: " + (parseInt(res) * 1e-18).toFixed(2) + "\n";
                listOfAccountsL1.innerText = str1;
            })
        }
        else {
            str2 += i + ". " + accounts[i] + ", balance: " + balances[i] + "\n";
            listOfAccountsL2.innerText = str2;
        }
    }
}

web3.eth.getAccounts().then((res) => { accounts = res; console.log(accounts); }).then(() => {
    updateListOfAccounts();
})


middleware.events._e_valid_proof_register(function (err, res) {
    for (let i = 0; i < 4; ++i) {
        let pos = 0;
        for (let j = 0; j < accounts.length; ++j) {
            if (accounts[j] == deposit_pending_tx_register[i]._to) {
                pos = j;
                break
            }
        }
        balances[pos] += parseInt(deposit_pending_tx_register[i]._amount);
    }
    deposit_pending_tx_register = deposit_pending_tx_register.slice(Math.pow(2, Math.floor(Math.log2(deposit_pending_tx_register.length))));
    depositRegisterTx.innerText = deposit_pending_tx_register;

    previousAccountRoot.innerText = newestAccountRoot.innerText;
    newestAccountRoot.innerText = Account_Tree.root.hash_value;
    updateListOfAccounts();
    AccountTree.innerText = Account_Tree.toStr();
})
middleware.events._e_invalid_proof_register(function (err, res) {
    console.log("e_invalid_proof");
})


middleware.events._e_valid_proof_existence(function (err, res) {
    for (let i = 0; i < 4; ++i) {
        let pos = 0;
        for (let j = 0; j < accounts.length; ++j) {
            if (accounts[j] == deposit_pending_tx_existence[i]._to) {
                pos = j;
                break
            }
        }
        balances[pos] += parseInt(deposit_pending_tx_existence[i]._amount);
    }
    deposit_pending_tx_existence = deposit_pending_tx_existence.slice(Math.pow(2, Math.floor(Math.log2(deposit_pending_tx_existence.length))));
    depositExistenceTx.innerText = deposit_pending_tx_existence;
    previousAccountRoot.innerText = newestAccountRoot.innerText;
    newestAccountRoot.innerText = Account_Tree.root.hash_value;
    updateListOfAccounts();
    AccountTree.innerText = Account_Tree.toStr();
})
middleware.events._e_invalid_proof_existence(function (err, res) {
    console.log("e_invalid_proof");
})



middleware.events._e_process_deposit_register(function (err, res) {
    console.log('[Process Deposit]');
    if (err) {
        console.log("err: " + err);
    }
    else {
        let smart_contract_register_root = res.returnValues.root;

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

        // create zk-proof
        let zk_proof = new Zk_proof(res.returnValues.root, DR_Proofs, DR_Path, DR_intermediate_acc_root)
        // verify using onchain smart contract
        middleware.methods._verify_process_deposit_register(
            DR_Proofs, DR_Path, DR_intermediate_acc_root).send(
                {
                    from: accounts[0],
                    value: 0,
                    gas: 100000

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
        let smart_contract_existence_root = res.returnValues.root;
        console.log('be-tx:');
        console.log(deposit_pending_tx_existence);
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
                console.log('Account Tree:');
                console.log(Account_Tree);
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
                    from: accounts[0],
                    value: 0,
                    gas: 500000

                }
                , function (err, res) {
                    console.log("err: " + err);
                    console.log("res: " + res);
                });
        }
    }
})

submitBtn.addEventListener('click', function (res) {
    const from = FROM.value;
    const to = TO.value;
    const amount = AMOUNT.value;

    console.log('from: ' + from);
    console.log('to: ' + to);
    console.log('amount: ' + amount);

    middleware.methods._deposit(accounts[to], amount).send({
        from: accounts[from],
        value: amount * 1e18,
        gas: 500000
    }, function (err, res) {
        if (err) {
            console.log("err: " + err);
        }
        else {
            console.log("res: " + res);
        }
    })
})


middleware.events._e_get_deposit_register_root(function (err, res) {
    console.log("[Get Register Root]");
    if (err) {
        console.log(err);
    }
    else {
        console.log(res);
        depositRegisterRootOnchain.innerText = res.returnValues.value;
    }
});

middleware.events._e_get_deposit_existence_root(function (err, res) {
    console.log("[Get Existence Root]");
    if (err) {
        console.log(err);
    }
    else {
        console.log(res);
        depositExistenceRootOnchain.innerText = res.returnValues.value;
    }
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

        let real_size_register = Math.pow(2, Math.floor(Math.log2(deposit_pending_tx_register.length)));
        let temp_register = new MERKLE_TREE(deposit_pending_tx_register.slice(0, real_size_register));
        depositRegisterRoot.innerText = temp_register.root.hash_value;
        depositRegisterTx.innerText = deposit_pending_tx_register;
        updateListOfAccounts();

        middleware.methods._get_deposit_register_root().send({
            from: accounts[0],
            gas: 100000
        }, function () { })

        if (deposit_pending_tx_register.length % 4 == 0) {
            middleware.methods._process_deposit_register().send({
                from: accounts[0],
                gas: 500000
            }, function () { console.log("CALL PROCESS DEPOSIT"); })
        }
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

        let real_size_existence = Math.pow(2, Math.floor(Math.log2(deposit_pending_tx_existence.length)));
        let temp_existence = new MERKLE_TREE(deposit_pending_tx_existence.slice(0, real_size_existence));
        depositExistenceRoot.innerText = temp_existence.root.hash_value;
        depositExistenceTx.innerText = deposit_pending_tx_existence;

        console.log("deposit_pending_tx_existence: ");
        console.log(deposit_pending_tx_existence);

        middleware.methods._get_deposit_existence_root().send({
            from: accounts[0],
            gas: 100000
        }, function () { })

        if (deposit_pending_tx_existence.length % 4 == 0) {
            middleware.methods._process_deposit_existence().send({
                from: accounts[0],
                gas: 500000
            }, function () { console.log("CALL PROCESS DEPOSIT"); })
        }
    }
});
