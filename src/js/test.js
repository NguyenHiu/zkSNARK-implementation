const DEPOSIT = require("./modules/deposit");
const { MERKLE_TREE, MERKLE_TREE_NIL } = require("./modules/merkle_tree");
const Hash0 = require("./modules/hash_0");
const Web3 = require("web3");
const web3 = new Web3();

var deposit_txs = [
    new DEPOSIT('0x995440730C86317eeB1E70E9Bb0DCbeb3fa5Bb30', '0x995440730C86317eeB1E70E9Bb0DCbeb3fa5Bb30', '20'),
    new DEPOSIT('0x1bEd454c6594235de5E58De514A99999B890b638', '0x1bEd454c6594235de5E58De514A99999B890b638', '20'),
    // new DEPOSIT('0x4c34041763aaAB747931f442972A695b1dfD6c61', '0x4c34041763aaAB747931f442972A695b1dfD6c61', '20'),
    // new DEPOSIT('0x0Fd836eE927caB78feDa2e371Ec7F83D613d3de6', '0x0Fd836eE927caB78feDa2e371Ec7F83D613d3de6', '20'),
    // new DEPOSIT('0x918c56A7EEa4211f977Ae52f57e785da276e65fC', '0x918c56A7EEa4211f977Ae52f57e785da276e65fC', '20'),
    // new DEPOSIT('0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0'),
    // new DEPOSIT('0x1E45a966F6E494cEf37D506Df7713c300229D7f6', '0x1E45a966F6E494cEf37D506Df7713c300229D7f6', '20'),
    // new DEPOSIT('0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0'),
]

var tree = new MERKLE_TREE(deposit_txs);
tree._print(tree.root, 0);

console.log(web3.utils.soliditySha3(
    { type: 'bytes32', value: '56dd288068fcb002668b6feacc7cefac3ebb59343749a33f8c9f03b6cca47774' },
    { type: 'bytes32', value: '876f6f3eda5ff41020a28a51ae09cee1ba44b24e231b0e9b386f95f47ee3cfd3' }
));

// var proof = tree.find_empty_tree(1);
// console.log(proof);

// console.log(web3.utils.soliditySha3(
//     {type: 'bytes32'}
// ));

// console.log(web3.utils.soliditySha3(
//     { type: 'bytes32', value: '0x98b3027c932160df43b77571428cf769653c12a780d44c59cd16d97c46da6fb1' },
//     { type: 'bytes32', value: '0x98b3027c932160df43b77571428cf769653c12a780d44c59cd16d97c46da6fb1' }
// ));


// console.log(web3.utils.soliditySha3(
//     { type: 'bytes32', value: '0x95947d1eb9b4e4e56aa672cf5efc908e70c12c420a89c7394a38fe394c7fd8cc' },
//     { type: 'bytes32', value: '0x95947d1eb9b4e4e56aa672cf5efc908e70c12c420a89c7394a38fe394c7fd8cc' }
// ));