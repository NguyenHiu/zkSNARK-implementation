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
]


var deposit_tx_list_2 = [
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
]

var deposit_tx_list_3 = [
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
    new Deposit('0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '0xF712E922C7ca872427a5f98d8422A72e0aBeECd7', '20'),
]
var merkle_tree = new MERKLE_TREE_NIL(8);
var subtree = new MERKLE_TREE(deposit_tx_list_2);
var subtree2 = new MERKLE_TREE(deposit_tx_list_3);

merkle_tree._print(merkle_tree.root, 0);

var res = merkle_tree.find_empty_tree(Math.log2(deposit_tx_list_2.length));
if (res.proof != null) {
    merkle_tree.add_sub_tree_according_path(subtree.root, res.path)
    merkle_tree._print(merkle_tree.root, 0);
}
else {
    console.log('res.proof == null');
}
// console.log('separate\n\n');
// var res = merkle_tree.find_empty_tree(Math.log2(deposit_tx_list_3.length));
// if (res.proof != null) {
//     merkle_tree.add_sub_tree_according_path(subtree2.root, res.path)
//     merkle_tree._print(merkle_tree.root, 0);
// }
// else {
//     console.log('res.proof == null');
// }
