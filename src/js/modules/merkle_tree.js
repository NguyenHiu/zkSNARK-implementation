const Web3 = require('web3');
const NODE = require("./node");
const Hash0 = require("./hash_0");
const web3 = new Web3();


class MERKLE_TREE_NIL {
    root;
    height;
    no_left_node;

    constructor(no_leaf_node) {
        this.no_leaf_node = no_leaf_node;
        this.height = Math.log2(no_leaf_node);

        var leaves = []
        for (let i = 0; i < no_leaf_node; ++i) {
            leaves.push(Hash0.hash0);
        }

        this.root = this._construct_merkle_tree(leaves);
    }

    _construct_merkle_tree(leaves) {
        if (leaves.length == 2) {
            return new NODE(new NODE(), new NODE(), null, Hash0.hash1);
        }

        var half_idx = leaves.length / 2;
        var first_ = leaves.slice(0, half_idx);
        var second_ = leaves.slice(half_idx);
        var left = this._construct_merkle_tree(first_);
        var right = this._construct_merkle_tree(second_);

        return new NODE(left, right, null,
            web3.utils.soliditySha3(
                { type: 'bytes32', value: left.hash_value },
                { type: 'bytes32', value: right.hash_value }
            ));
    }

    find_empty_tree(height) {
        return this._find_empty_tree(this.root, height);
    }

    _find_empty_tree(root, height) {
        if (root != null) {
            if ((root.height == height) && (root.hash_value == Hash0[`hash${height}`]))
                return { proof: this.merke_proof(root), path: [] };
            var left = this._find_empty_tree(root.left, height);
            if (left.proof != null)
                return { proof: left.proof, path: ([0]).concat(left.path) };
            var right = this._find_empty_tree(root.right, height);
            return { proof: right.proof, path: ([1]).concat(right.path) };
        }
        return { proof: null, path: [] };
    }

    merke_proof(root) {
        var proof = [];
        while ((root != null) && (root != this.root)) {
            var sibling = this._merkle_proof(root);
            if (sibling == null) {
                console.log("my sibling is null :<");
                return null;
            }
            proof.push(sibling.hash_value);
            root = root.parent;
        }
        if (root == null) {
            console.log("something is wrong because of the null value of root");
            return null;
        }
        return proof;
    }

    _merkle_proof(root) {
        if (root.parent == null) {
            return null;
        }
        if (root == root.parent.left) {
            return root.parent.right;
        }
        else {
            return root.parent.left;
        }
    }

    add_sub_tree_according_path(subtree_root, path) {
        if (path.length == 0) {
            this.root = subtree_root;
            return;
        }

        var curr_root = this.root;
        for (let i = 0; i < path.length; ++i) {
            if (path[i] == 0)
                curr_root = curr_root.left;
            else
                curr_root = curr_root.right;
        }
        if (path[path.length - 1] == 0) {
            curr_root.parent.left = subtree_root;
        }
        else
            curr_root.parent.right = subtree_root
        subtree_root.parent = curr_root.parent
        this._update_hash_values_after_add_subtree_path_version(subtree_root, path);
    }

    _update_hash_values_after_add_subtree_path_version(curr_node, path) {
        // require: path.length != 0 --> update only if it need updating
        var tmp_node = curr_node;
        for (let i = path.length - 1; i >= 0; --i) {
            if (path[i] == 0) // left 
                tmp_node.parent.hash_value = web3.utils.soliditySha3(
                    { type: 'bytes32', value: tmp_node.hash_value },
                    { type: 'bytes32', value: tmp_node.parent.right.hash_value }
                )
            else // right
                tmp_node.parent.hash_value = web3.utils.soliditySha3(
                    { type: 'bytes32', value: tmp_node.parent.left.hash_value },
                    { type: 'bytes32', value: tmp_node.hash_value }
                )
            tmp_node = tmp_node.parent;
        }
    }

    _print(root, cnt) {
        if (root != null) {
            var space = ''
            for (let i = 0; i < cnt; ++i)
                space += '   '
            console.log(space + root.hash_value);
            this._print(root.left, cnt + 1);
            this._print(root.right, cnt + 1);
        }
    }
}

class MERKLE_TREE {
    root;
    height;
    no_leaf_node;

    constructor(leaf_node_list) {
        if (leaf_node_list.length == 0) {
            this.root = null;
            this.height = 0;
            this.no_leaf_node = 0;
            return;
        }

        var lg2 = Math.log2(leaf_node_list.length);
        this.height = Math.floor(lg2);
        this.no_leaf_node = 2 ** this.height;
        var leaves = leaf_node_list.slice(0, this.no_leaf_node);
        console.log("leaves: ");
        console.log(leaves);
        this.root = this._construct_merkle_tree(leaves);
    }

    _construct_merkle_tree(leaves) {
        if (leaves.length == 1) {
            console.log("_construct_merkle_tree_1");
            return new NODE(null, null, null,
                web3.utils.soliditySha3(
                    { type: 'address', value: leaves[0]._from },
                    { type: 'address', value: leaves[0]._to },
                    { type: 'uint', value: leaves[0]._amount },
                ));
        }
        else if (leaves.length == 2) {
            console.log("_construct_merkle_tree_2");
            var left = new NODE(null, null, null,
                web3.utils.soliditySha3(
                    { type: 'address', value: leaves[0]._from },
                    { type: 'address', value: leaves[0]._to },
                    { type: 'uint', value: leaves[0]._amount }
                ));
            var right = new NODE(null, null, null,
                web3.utils.soliditySha3(
                    { type: 'address', value: leaves[1]._from },
                    { type: 'address', value: leaves[1]._to },
                    { type: 'uint', value: leaves[1]._amount }
                ));
            return new NODE(left, right, null,
                web3.utils.soliditySha3(
                    { type: 'bytes32', value: left.hash_value },
                    { type: 'bytes32', value: right.hash_value }
                ));
        }

        var half_idx = leaves.length / 2;
        var first_ = leaves.slice(0, half_idx);
        var second_ = leaves.slice(half_idx);
        var left = this._construct_merkle_tree(first_);
        var right = this._construct_merkle_tree(second_);

        return new NODE(left, right, null,
            web3.utils.soliditySha3(
                { type: 'bytes32', value: left.hash_value },
                { type: 'bytes32', value: right.hash_value }
            ));
    }

    find_empty_tree(height) {
        return this._find_empty_tree(this.root, height);
    }

    _find_empty_tree(root, height) {
        if (root != null) {
            if ((root.height == height) && (root.hash_value == Hash0[`hash${height}`]))
                return { proof: this.merke_proof(root), path: [] };
            var left = this._find_empty_tree(root.left, height);
            if (left.proof != null)
                return { proof: left.proof, path: ([0]).concat(left.path) };
            var right = this._find_empty_tree(root.right, height);
            return { proof: right.proof, path: ([1]).concat(right.path) };
        }

        return { proof: null, path: [] };
    }

    merke_proof(root) {
        var proof = [];
        while ((root != null) && (root != this.root)) {
            var sibling = this._merkle_proof(root);
            if (sibling == null) {
                console.log("my sibling is null :<");
                return null;
            }
            proof.push(sibling.hash_value);
            root = root.parent;
        }
        if (root == null) {
            console.log("something is wrong because of the null value of root");
            return null;
        }
        return proof;
    }

    _merkle_proof(root) {
        if (root.parent == null) {
            return null;
        }
        if (root == root.parent.left) {
            return root.parent.right;
        }
        else {
            return root.parent.left;
        }
    }

    _print(root, cnt) {
        if (root != null) {
            var space = ''
            for (let i = 0; i < cnt; ++i)
                space += '   '
            console.log(space + root.hash_value);
            this._print(root.left, cnt + 1);
            this._print(root.right, cnt + 1);
        }
    }
}

module.exports = { MERKLE_TREE, MERKLE_TREE_NIL }