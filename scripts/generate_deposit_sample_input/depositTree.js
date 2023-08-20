const Tree = require("./tree.js");

module.exports = class DepositTree extends Tree {
    constructor(_accounts, mimc) {
        super(_accounts.map(x => x.hash), mimc);
        this.accounts = _accounts;
    }
}