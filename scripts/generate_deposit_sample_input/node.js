module.exports = class Node {
    left;
    right;
    parent;
    hashValue;
    height;

    constructor(_left = null, _right = null, _parent = null, _hashValue = null) {
        this.left = left;
        this.right = right;
        this.parent = parent;
        this.hashValue = hashValue;
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