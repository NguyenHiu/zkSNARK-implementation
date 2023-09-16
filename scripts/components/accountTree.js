const Tree = require("./tree.js");
const Account = require("./account.js");
const { Empty, isEqual, ZeroPubKeyX, ZeroPubKeyY } = require("./utils.js");

module.exports = class AccountTree extends Tree {
    constructor(_accounts, mimc) {
        super(_accounts.map(x => x.hash), mimc);
        this.accounts = _accounts;
    }

    existAccount(pubX, pubY, mimc) {
        const _pX = mimc.F.e(pubX)
        const _pY = mimc.F.e(pubY)
        this.accounts.forEach(account => {
            if (isEqual(_pX, account.pubkeyX) && isEqual(_pY, account.pubkeyY))
                return account.index;
        })
        return -1;
    }

    #nextIndex() {
        for (let i = 0; i < this.accounts.length; ++i) {
            if (isEqual(this.accounts[i].pubkeyX, ZeroPubKeyX) &&
                isEqual(this.accounts[i].pubkeyY, ZeroPubKeyY))
                return i;
        }
    }

    // return index in $row which is the root of empty subtree
    #existEmptySubTreeAt(row) {
        for (let i = 0; i < this.innerNodes[row].length; ++i) {
            if (isEqual(this.innerNodes[row][i], Empty[this.depth - row])) // 3 - 1 = 2
                return i;
        }
    }

    // get proof, proofPos of an inner node (not leaf)
    #getProofInnerNode(row, col) {
        const proof = [];
        const pos = [];
        let idx = col;
        for (let i = row; i >= 1; --i) {
            if (idx % 2 != 0) {
                proof.push(this.innerNodes[i][idx - 1]);
                pos.push(0);
            }
            else {
                proof.push(this.innerNodes[i][idx + 1]);
                pos.push(1);
            }
            idx = Math.floor(idx / 2);
        }
        return {
            proof,
            pos
        };
    }

    // insert $txTree into the tree at $_row and $_col
    #updateSubTree(accTree, _row, _col, mimc) {
        let row = _row;
        let col = _col;
        for (let i = 0; i < accTree.depth; ++i) {
            for (let j = 0; j < accTree.innerNodes[i].length; ++j) {
                this.innerNodes[row][col + j] = accTree.innerNodes[i][j];
            }
            row += 1;
            col *= 2;
        }

        for (let i = 0; i < accTree.accounts.length; ++i) {
            this.accounts[col + i] = accTree.accounts[i];
        }

        this.leafNodes = this.accounts.map(x => x.hash);

    }

    // re-hashing all the tree after inserting new subtree (after #updateSubTree() function)
    #rehashingFromInnerNode(_newValue, row, col, proof, path, mimc) {
        let idx = col;
        let newValue = _newValue;

        for (let i = row; i >= 1; --i) {
            this.innerNodes[i][idx] = newValue;
            if (path[row - i] == 0) {
                newValue = mimc.multiHash([
                    proof[row - i],
                    newValue
                ]);
            }
            else {
                newValue = mimc.multiHash([
                    newValue,
                    proof[row - i]
                ]);
            }
        }
        this.innerNodes[0][0] = newValue;
    }

    // public
    // [DEPOSIT REGISTER]
    // process transactions of $txDepositTree 
    processDepositRegisterTxTree(txDepositTree, mimc, eddsa) {
        // assume that all transactions are valid!
        const currentAccountRoot = this.root;
        const newAccount = [];
        const accountIndexFrom = this.#nextIndex();
        for (let i = 0; i < txDepositTree.txs.length; ++i) {
            if (txDepositTree.txs[i].checkSignature(mimc, eddsa) == false) {
                console.log(`index ${i} has wrong signature`);
            }
            newAccount.push(new Account(
                accountIndexFrom+i, txDepositTree.txs[i].toX,
                txDepositTree.txs[i].toY,
                txDepositTree.txs[i].amount,
                txDepositTree.txs[i].nonce, mimc));
        }
        const newAccountRootRow = this.depth - txDepositTree.depth;
        const newAccountRootCol = this.#existEmptySubTreeAt(newAccountRootRow);
        const { proof, pos } = this.#getProofInnerNode(newAccountRootRow, newAccountRootCol);
        const registerAccountTree = new AccountTree(newAccount, mimc);
        this.#updateSubTree(registerAccountTree, newAccountRootRow, newAccountRootCol, mimc);
        this.#rehashingFromInnerNode(registerAccountTree.root, newAccountRootRow, newAccountRootCol, proof, pos, mimc);
        this.root = this.innerNodes[0][0];

        return {
            oldAccountRoot: currentAccountRoot,
            newAccountRoot: this.root,
            proofExistEmptySubTree: proof,
            proofPosExistEmptySubTree: pos,
            txDepositTree: txDepositTree,
            registerAccountTree: registerAccountTree
        }
    }

    //public
    // [DEPOSIT EXSITENCE] 
    processDepositExistenceTree(txDepositTree, mimc, eddsa) {
        const proof = [];
        const proofPos = [];
        const intermediateRoot = [];
        const oldAccountRoot = this.root;
        txDepositTree.txs.forEach(tx => {
            const receiver = this.findAccountByPubkey(tx.toX, tx.toY);
            const _r_proof = this.getProof(receiver.index);
            const r_existenceProof = _r_proof.proof;
            const r_existenceProofPos = _r_proof.proofPos;
            receiver.acceptReceiveTx(tx.amount, mimc);
            this.leafNodes[receiver.index] = receiver.hash;
            this.rehashingTree(receiver.index, r_existenceProof, r_existenceProofPos, mimc);
            this.root = this.innerNodes[0][0];

            proof.push(r_existenceProof);
            proofPos.push(r_existenceProofPos);
            intermediateRoot.push(this.root);
        })

        return {
            proof: proof,
            proofPos: proofPos,
            oldAccountRoot: oldAccountRoot,
            intermediateRoot:  intermediateRoot,
            txDepositTree: txDepositTree
        }
    }

    // public
    // [TRANSFER]
    processTxTree(txTree, mimc) {
        const currentAccountRoot = this.root;
        const txExistenceProofs = [];
        const txExistenceProofPos = [];
        const txDetails = [];
        for (let idx = 0; idx < txTree.txs.length; ++idx) {
            const { proof, path } = txTree.getProof(idx);
            txExistenceProofs.push(proof);
            txExistenceProofPos.push(path);
            txDetails.push(this.processTx(txTree.txs[idx], mimc));
        }

        return {
            currentAccountRoot: currentAccountRoot,
            txRree: txTree,
            txProofs: txExistenceProofs,
            txProofPos: txExistenceProofPos,
            txDetails: txDetails
        };
    }

    // private
    // [TRANSFER]
    processTx(tx, mimc) {
        const sender = this.findAccountByPubkey(tx.fromX, tx.fromY);
        const s_proof = this.getProof(sender.index);
        const s_existenceProof = s_proof.proof;
        const s_existenceProofPos = s_proof.proofPos;
        const s_nonce = sender.nonce;
        const s_balance = sender.balance;

        sender.acceptSendTx(tx.amount, mimc);
        this.leafNodes[sender.index] = sender.hash;
        this.rehashingTree(sender.index, s_existenceProof, s_existenceProofPos, mimc);
        this.root = this.innerNodes[0][0];

        const s_intermediateRoot = this.root;

        const receiver = this.findAccountByPubkey(tx.toX, tx.toY);
        const r_proof = this.getProof(receiver.index);
        const r_existenceProof = r_proof.proof;
        const r_existenceProofPos = r_proof.proofPos;
        const r_nonce = receiver.nonce;
        const r_balance = receiver.balance;

        receiver.acceptReceiveTx(tx.amount, mimc);
        this.leafNodes[receiver.index] = receiver.hash;
        this.rehashingTree(receiver.index, r_existenceProof, r_existenceProofPos, mimc);
        this.root = this.innerNodes[0][0];

        const r_intermediateRoot = this.root;

        // return information is used to verify this process is correct!
        return {
            senderProof: s_existenceProof,
            senderProofPos: s_existenceProofPos,
            senderIntermediateRoot: s_intermediateRoot,
            senderNonce: s_nonce,
            senderBalance: s_balance,

            receiverProof: r_existenceProof,
            receiverProofPos: r_existenceProofPos,
            receiverIntermediateRoot: r_intermediateRoot,
            receiverNonce: r_nonce,
            receiverBalance: r_balance,
        };
    }

    findAccountByPubkey(x, y) {
        for (let i = 0; i < this.accounts.length; ++i) {
            if (isEqual(this.accounts[i].pubkeyX, x) &&
                isEqual(this.accounts[i].pubkeyY, y))
                return this.accounts[i];
        }
    }

    // front-end func
    getAccountTreeAsText(mimc) {
        let str = "<pre>";
        str += "<b>0x" + mimc.F.toString(this.root, 16).padStart(64, "0") + "</b> <br>";
        let space = "|";
        str += space + "<br>";
        str += space + "====" + this._getSubAccountTreeAsText(mimc, space + "      |", 1, 0) + "<br>";
        str += space + "<br>";
        str += space + "====" + this._getSubAccountTreeAsText(mimc, space + "      |", 1, 1);
        str += "</pre>"
        return str;
    }

    _getSubAccountTreeAsText(mimc, space, row, col) {
        if (row == this.depth)
            return this._getAccountAtIndexAsText(mimc, space, col);
        let str = "<b> 0x" + mimc.F.toString(this.innerNodes[row][col], 16).padStart(64, "0") + "</b> <br>";
        str += space + "<br>";
        str += space + "====" + this._getSubAccountTreeAsText(mimc, space + "      |", row + 1, col * 2) + "<br>";
        str += space + "<br>";
        str += space + "====" + this._getSubAccountTreeAsText(mimc, space + "      |", row + 1, col * 2 + 1);
        return str;
    }

    _getAccountAtIndexAsText(mimc, space, index) {
        let str = "<b> 0x" + mimc.F.toString(this.accounts[index].hash, 16).padStart(64, "0") + "</b> <br>";
        str += space + "------------ [index: " + this.accounts[index].index + "<br>";
        str += space + "------------ [pubX: " + "0x" + mimc.F.toString(this.accounts[index].pubkeyX, 16).padStart(64, "0") + "<br>";
        str += space + "------------ [pubY: " + "0x" + mimc.F.toString(this.accounts[index].pubkeyY, 16).padStart(64, "0") + "<br>";
        str += space + "------------ [balance: " + mimc.F.toString(this.accounts[index].balance) + "<br>";
        str += space + "------------ [nonce: " + mimc.F.toString(this.accounts[index].nonce);
        return str;
    }

}