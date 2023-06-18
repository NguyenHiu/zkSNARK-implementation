// import Web3 from "web3";
import NODE from "./node.js";
import DEPOSIT from "./deposit.js";
import Hash0 from "./hash_0.js";
const web3 = new Web3();

class MT {
    constructor(leaves) {
        this.height = Math.log2(leaves.length);
        console.log("this.height: " + this.height);
        this.leaves_in4 = leaves;
        this.root = this._construct_merkle_tree(leaves);
    }
    _construct_merkle_tree(leaves) {
        if (leaves.length == 1) {
            return new NODE(null, null, null,
                web3.utils.soliditySha3(
                    { type: 'address', value: leaves[0]._from },
                    { type: 'address', value: leaves[0]._to },
                    { type: 'uint', value: leaves[0]._amount },
                ));
        }
        else if (leaves.length == 2) {
            let left = new NODE(null, null, null,
                web3.utils.soliditySha3(
                    { type: 'address', value: leaves[0]._from },
                    { type: 'address', value: leaves[0]._to },
                    { type: 'uint', value: leaves[0]._amount }
                ));
            let right = new NODE(null, null, null,
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

        let half_idx = leaves.length / 2;
        let first_ = leaves.slice(0, half_idx);
        let second_ = leaves.slice(half_idx);
        let left = this._construct_merkle_tree(first_);
        let right = this._construct_merkle_tree(second_);
        return new NODE(left, right, null,
            web3.utils.soliditySha3(
                { type: 'bytes32', value: left.hash_value },
                { type: 'bytes32', value: right.hash_value }
            ));
    }

    has(leaf) {
        console.log('leaf: ');
        console.log(leaf);
        for (let i = 0; i < this.leaves_in4.length; ++i) {
            if (this.leaves_in4[i].is(leaf))
                return i;
        }
        return -1;
    }

    has_address(addr) {
        for (let i = 0; i < this.leaves_in4.length; ++i) {
            if (this.leaves_in4[i]._to == addr)
                return i;
        }
        return -1;
    }

    get_merkle_proof_leaf(leaf) {
        let pos = this.has(leaf);
        if (pos == -1)
            return { proof: [], path: [] };

        let proof = [], path = [];
        let curr = this.root, len = this.leaves_in4.length;
        for (let i = 0; i < this.height; ++i) {
            if (pos >= len / 2) {
                proof = [curr.left.hash_value].concat(proof);
                path = [1].concat(path);
                curr = curr.right;
                pos -= len / 2;
            }
            else {
                proof = [curr.right.hash_value].concat(proof);
                path = [0].concat(path);
                curr = curr.left;
            }
            len /= 2;
        }
        return { proof: proof, path: path };
    }

    _print(root, cnt) {
        if (root != null) {
            let space = ''
            for (let i = 0; i < cnt; ++i)
                space += '   '
            console.log(space + root.hash_value);
            this._print(root.left, cnt + 1);
            this._print(root.right, cnt + 1);
        }
    }

    _toStr(root, cnt) {
        if (root == null)
            return "";
        let space = '';
        for (let i = 0; i < cnt - 1; ++i)
            space += '..|.....'
        if (cnt != 0)
            space += '..|--- '

        let res = space + root.hash_value + "\n";
        res += this._toStr(root.left, cnt + 1);
        res += this._toStr(root.right, cnt + 1);
        return res;
    }

    toStr() {
        return this._toStr(this.root, 0);
    }
}

class MERKLE_TREE extends MT {
    constructor(leaves) {
        super(leaves);
    }
}

// Account Tree
class MERKLE_TREE_NIL extends MT {
    constructor(no_leaves) {
        let leaves = [];
        for (let i = 0; i < no_leaves; ++i) {
            leaves.push(
                new DEPOSIT(
                    '0x0000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000',
                    0)
            );
        }
        super(leaves);
    }

    find_empty_tree(height) {
        return this._find_empty_tree(this.root, height);
    }

    _find_empty_tree(root, height) {
        if (root != null) {
            if ((root.height == height) && (root.hash_value == Hash0[`hash${height}`]))
                return { proof: this.merke_proof_of_subtree(root), path: [] };
            let left = this._find_empty_tree(root.left, height);
            if (left.proof != null)
                return { proof: left.proof, path: left.path.concat([0]) };
            let right = this._find_empty_tree(root.right, height);
            return { proof: right.proof, path: right.path.concat([1]) };
        }
        return { proof: null, path: [] };
    }

    merke_proof_of_subtree(root) {
        let proof = [];
        while ((root != null) && (root != this.root)) {
            let sibling = this._get_sibling_of(root);
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

    _get_sibling_of(root) {
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

    add_subtree_according_path(subtree_root, leaves, path) {
        if (path.length == 0) {
            this.root = subtree_root;
            this.leaves_in4 = leaves;
            return;
        }

        let curr_root = this.root, len = this.leaves_in4.length, l = 0, r = len - 1;
        for (let i = path.length - 1; i >= 0; --i) {
            if (path[i] == 0) {
                curr_root = curr_root.left;
                r = len / 2 - 1;
            } else {
                curr_root = curr_root.right;
                l = len / 2;
            }
            len /= 2;
        }
        if (path[0] == 0)
            curr_root.parent.left = subtree_root;
        else
            curr_root.parent.right = subtree_root
        subtree_root.parent = curr_root.parent

        //err here
        // if (r == -1) // l == 0
        // {
        //     this.leaves_in4[l]
        // }
        for (let i = l; i <= r; ++i)
            this.leaves_in4[i] = leaves[i - l];

        this._update_hash_values_after_add_subtree_path_version(subtree_root, path);
    }

    _update_hash_values_after_add_subtree_path_version(curr_node, path) {
        // require: path.length != 0 --> update only if it need updating
        let tmp_node = curr_node;
        for (let i = 0; i < path.length; ++i) {
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
}

export { MERKLE_TREE, MERKLE_TREE_NIL };