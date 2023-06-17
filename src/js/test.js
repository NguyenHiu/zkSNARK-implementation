
const Web3 = require("web3");
const ganahce = require("ganache");
const abi = require("./_abi.json");
const smart_contract_address = require("./_smart_contract_address.json");
const DEPOSIT = require('./modules/deposit');
const { MERKLE_TREE, MERKLE_TREE_NIL } = require('./modules/_new_merkle_tree');
const NODE = require("./modules/node");

const provider = ganahce.provider();
const web3 = new Web3(provider);

provider.request({
    method: "eth_accounts",
    params: []
}).then(console.log)

// console.log(accounts);