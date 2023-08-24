const Tree = require("./tree.js");
const Transaction = require("./transaction.js");
const Account = require("./account.js");
const bigInt = require("snarkjs").bigInt;
const { Empty, isEqual, uint8ArrayToBigInt } = require("./utils.js");

module.exports = class AccountTree extends Tree {
    constructor(_accounts, mimc) {
        super(_accounts.map(x => x.hash), mimc);
        this.accounts = _accounts;
    }

    existEmptySubTreeAt(row) { // 1
        for (let i = 0; i < this.innerNodes[row].length; ++i) {
            if (isEqual(this.innerNodes[row][i], Empty[this.depth - row])) // 3 - 1 = 2
                return i;
        }
    }

    getProofInnerNode(row, col) {
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
            proof: proof,
            pos: pos
        };
    }

    updateSubTree(txTree, rootCol, rootRow) {
        let row = rootRow;
        let col = rootCol;
        for (let i = 0; i < txTree.depth; ++i) {
            for (let j = 0; j < txTree.innerNodes[i].length; ++j) {
                this.innerNodes[row][col + j] = txTree.innerNodes[i][j];
            }
            row += 1
        }
    }

    rehashingFromInnerNode(_newValue, col, row, proof, path, mimc) {
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

    processTxTreeDepositRegister(depositTree, mimc) {
        const row = this.depth - depositTree.depth; // 3 - 2 = 1 
        const col = this.existEmptySubTreeAt(row); // (1)
        const { proof, pos } = this.getProofInnerNode(row, col);

        this.updateSubTree(depositTree, col, row);
        this.rehashingFromInnerNode(depositTree.root, col, row, proof, pos, mimc);
        this.root = this.innerNodes[0][0];

        const startIdx = col * (Math.pow(2, depositTree.depth));
        for (let i = 0; i < depositTree.accounts.length; ++i) {
            this.accounts[startIdx + i] = depositTree.accounts[i];
            this.leafNodes[startIdx + i] = depositTree.accounts[i].hash;
        }

        return {
            newAccountRoot: this.root, // !!!!!! PAY ATTENTION HERE
            proof: proof,
            proofPos: pos
        }
    }

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

    processTx(tx, mimc) {
        console.log("check signature: ", tx.checkSignature());

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
            if ((this.accounts[i].pubkeyX == x) &&
                (this.accounts[i].pubkeyY == y))
                return this.accounts[i];
        }
    }

}