const Tree = require("./tree.js");
const Transaction = require("./transaction.js");
const Account = require("./account.js");
const {Empty, isEqual} = require("./utils.js");

module.exports = class AccountTree extends Tree {
    constructor(_accounts, mimc) {
        super(_accounts.map(x => x.hash), mimc);
        this.accounts = _accounts;
    }

    existEmptySubTreeAt(row) {
        for (let i = 0; i < this.innerNodes[row].length; ++i) {
            if (isEqual(this.innerNodes[row][i], Empty[this.depth - row]))
                return i;
        }
    }

    getProofInnerNode(row, col) {
        const proof = [];
        const pos = [];
        let idx = col;
        console.log("idx: ", idx);
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
            proof: proof,
            pos: pos
        };
    }

    updateSubTree(txTree, rootCol, rootRow) {
        let row = rootRow;
        let col = rootCol;
        for (let i = 0; i < txTree.depth; ++i) {
            for (let j = 0; j < txTree.innerNodes[i].length; ++j) {
                this.innerNodes[row][col+j] = txTree.innerNodes[i][j];
            }
            row += 1
        }
    }

    rehashingFromInnerNode(_newValue, col, row, proof, path, mimc) {
        let idx = col;
        let newValue = _newValue;
        for (let i = row; i >= 1; --i) {
            this.innerNodes[i][idx] = newValue;
            if (path[row-i] == 0) {
                newValue = mimc.multiHash([
                    proof[row-i],
                    newValue
                ]);
            }
            else {
                newValue = mimc.multiHash([
                    newValue,
                    proof[row-i]
                ]);
            }
        }
        this.innerNodes[0][0] = newValue;
    }

    processTxTreeDepositRegister(txTree, mimc) {
        const row = this.innerNodes.length - txTree.depth;
        const col = this.existEmptySubTreeAt(row);
        const { proof, pos } = this.getProofInnerNode(row, col);

        this.updateSubTree(txTree, col, row);
        this.rehashingFromInnerNode(txTree.root, col, row, proof, pos, mimc);
        this.root = this.innerNodes[0][0];
    }

    processTxTree(txTree, mimc) {
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
            txProofs: txExistenceProofs,
            txProofPos: txExistenceProofPos,
            txDetails: txDetails
        };
    }

    processTx(tx, mimc) {
        tx.checkSignature();

        const sender = this.findAccountByPubkey(tx.fromX, tx.fromY);
        const { s_existenceProof, s_existenceProofPos } = this.getProof(sender.index);
        const s_nonce = sender.nonce;
        const s_balance = sender.balance;

        sender.acceptSendTx(tx.amount, mimc);
        this.leafNodes[sender.index] = sender.hash;
        this.rehashingTree(sender.index, s_existenceProof, s_existenceProofPos, mimc);
        this.root = this.innerNodes[0][0];

        const s_intermediateRoot = this.root;

        const receiver = this.findAccountByPubkey(tx.toX, tx.toY);
        const { r_existenceProof, r_existenceProofPos } = this.getProof(receiver.index);
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
            sIntermediateRoot: s_intermediateRoot,
            receiverProof: r_existenceProof,
            receiverProofPos: r_existenceProofPos,
            rIntermediateRoot: r_intermediateRoot,
        };
    }

    findAccountByPubkey(x, y) {
        for (let i = 0; i < this.accounts.length; ++i) {
            if ((this.accounts[i].pubkeyX == x) &&
                (this.accounts[i].pubkeyY == y))
                return this.accounts[i];
        }
    }
}