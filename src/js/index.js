
import DEPOSIT from "./modules/deposit.js"
import { MERKLE_TREE, MERKLE_TREE_NIL } from "./modules/_new_merkle_tree.js";
import NODE from "./modules/node.js";
import Web3 from "./../../node_modules/web3";
import ganache from "./../../node_modules/ganache";

const provider = ganache.provider();
const web3 = new Web3(provider);
const abi = require("./_abi.json");
const smart_contract_address = require("./_smart_contract_address.json");

let accounts = []
provider.request({
    method: "eth_accounts",
    params: []
}).then((res) => { accounts = res; })
