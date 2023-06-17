import Hash0 from "./hash_0.js";

export default class NODE {
    left;
    right;
    parent;
    hash_value;
    height;

    constructor(left = null, right = null, parent = null, hash_value = Hash0.hash0) {
        this.left = left;
        this.right = right;
        this.parent = parent;
        this.hash_value = hash_value;
        if (left != null) {
            this.height = left.height + 1;
            left.parent = this;
        }
        else
            this.height = 0;

        if (right != null) {
            right.parent = this;
        }
    }

    copy() {
        return NODE(this.left, this.right, this.parent, this.hash_value);

    }
}