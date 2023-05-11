const Deposit = require("../../src/js/modules/deposit");
const { MERKLE_TREE, MERKLE_TREE_NIL } = require("../../src/js/modules/merkle_tree");


var deposit_tx_list = [
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0x31CC4315795A7bD55eB7aE79dcFa6013eba65320', '0x31CC4315795A7bD55eB7aE79dcFa6013eba65320', '20'),
    new Deposit('0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0'),
    new Deposit('0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0'),
    // new Deposit('0xb29DD34937a2a33Aa63b470Ee73962Bd48E4d5Cd', '0xb29DD34937a2a33Aa63b470Ee73962Bd48E4d5Cd', '20'),
    // new Deposit('0x933AE3a6c625ba44AA2dfb0EAfc815CF8C1906ec', '0x933AE3a6c625ba44AA2dfb0EAfc815CF8C1906ec', '20'),
    // new Deposit('0xD5E91862042DE972858fFca7a2Dd44C0D5D07588', '0xD5E91862042DE972858fFca7a2Dd44C0D5D07588', '20'),
    // new Deposit('0x69D2253b52b2A69a829002072874CDE804C4252a', '0x69D2253b52b2A69a829002072874CDE804C4252a', '20'),
]


var deposit_tx_list_2 = [
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    // new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    // new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    // new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    // new Deposit('0x31CC4315795A7bD55eB7aE79dcFa6013eba65320', '0x31CC4315795A7bD55eB7aE79dcFa6013eba65320', '20'),
    // new Deposit('0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0'),
    // new Deposit('0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0'),
    // new Deposit('0xb29DD34937a2a33Aa63b470Ee73962Bd48E4d5Cd', '0xb29DD34937a2a33Aa63b470Ee73962Bd48E4d5Cd', '20'),
    // new Deposit('0x933AE3a6c625ba44AA2dfb0EAfc815CF8C1906ec', '0x933AE3a6c625ba44AA2dfb0EAfc815CF8C1906ec', '20'),
    // new Deposit('0xD5E91862042DE972858fFca7a2Dd44C0D5D07588', '0xD5E91862042DE972858fFca7a2Dd44C0D5D07588', '20'),
    // new Deposit('0x69D2253b52b2A69a829002072874CDE804C4252a', '0x69D2253b52b2A69a829002072874CDE804C4252a', '20'),
]

var merkle_tree = new MERKLE_TREE_NIL(8);
var subtree = new MERKLE_TREE(deposit_tx_list_2);
// var subtree = new MERKLE_TREE_NIL(2);
subtree._print()
merkle_tree._print(merkle_tree.root, 0);
var res = merkle_tree.find_empty_tree(1);
if (res.proof != null) {
    console.log("proof: " + res.proof);
    console.log("path: " + res.path);
    console.log("adding ...");
    merkle_tree.add_sub_tree_according_path(subtree, res.path)
    console.log("new one: ");
    merkle_tree._print(merkle_tree.root, 0);
}
else {
    console.log('res.proof == null');
}
