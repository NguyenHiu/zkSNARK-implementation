const Web3 = require('web3');
var web3 = new Web3();

var hash_0 = web3.utils.soliditySha3(
    { type: 'uint', value: '0' }
)

var hash_0_0 = web3.utils.soliditySha3(
    { type: 'bytes32', value: hash_0 },
    { type: 'bytes32', value: hash_0 }
)

class Node {

    // field declarations
    left;
    right;
    parent;
    hash_value;

    // constructor
    constructor(left = null, right = null, parent = null, hash_value = hash_0) {
        this.left = left;
        this.right = right;
        this.parent = parent;
        this.hash_value = hash_value;
    }

    // methods
    // hash(value) {
    //     this.hash_value = web3.utils.soliditySha3(
    //         // {type: ''}
    //     )
    // }

    copy() {
        return Node(this.left, this.right, this.parent, this.hash_value);
    }
}


class Merkle_Tree {
    root;
    height;

    constructor(no_leaf_node) {
        this.no_leaf_node = no_leaf_node;
        this.height = Math.log(no_leaf_node) / Math.log(2);

        var leaves = []
        for (let i = 0; i < no_leaf_node; ++i) {
            leaves.push(hash_0);
        }

        this.root = this._construct_merkle_tree(leaves);
    }

    _construct_merkle_tree(leaves) {
        if (leaves.length == 2) {
            return new Node(null, null, null, hash_0_0);
        }

        var half_idx = leaves.length / 2;
        var first_ = [], second_ = [];
        for (let i = 0; i < half_idx; ++i) {
            first_.push(leaves[i]);
        }
        for (let i = half_idx; i < leaves.length; ++i) {
            second_.push(leaves[i]);
        }

        var left = this._construct_merkle_tree(first_);
        var right = this._construct_merkle_tree(second_);

        return new Node(left, right, null,
            web3.utils.soliditySha3(
                { type: 'bytes32', value: left.hash_value },
                { type: 'bytes32', value: right.hash_value }
            ));
    }

    merke_proof(height) {
        _height = this.height - height;

    }
}

var merkle = new Merkle_Tree(4);
console.log(merkle);