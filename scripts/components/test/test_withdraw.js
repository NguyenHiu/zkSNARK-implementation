const Account = require("../account.js");
const AccountTree = require("../accountTree.js");
const { buildMimc7 } = require("circomlibjs");
const { ZeroPubKeyX, ZeroPubKeyY } = require("../utils.js");
const { log } = require("console");

async function main() {
    const mimcjs = await buildMimc7();
    const Zero = new Account(0, ZeroPubKeyX, ZeroPubKeyY, 0, 0, mimcjs);
    accountTree = new AccountTree(new Array(8).fill(Zero), mimcjs);

    // accountTree.
}


main();