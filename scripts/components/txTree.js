const Tree = require("./tree.js");

module.exports = class TxTree extends Tree {
    constructor(_txs, mimc) {
        super(_txs.map(x => x.hash), mimc);
        this.txs = _txs;
    }
}