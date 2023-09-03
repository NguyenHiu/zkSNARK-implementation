
existEmptySubTreeAt(row) { 
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
    const oldAccountRoot = this.root;
    const depositRoot = depositTree.root;

    const row = this.depth - depositTree.depth;  
    const col = this.existEmptySubTreeAt(row);
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
        oldAccountRoot: oldAccountRoot,
        newAccountRoot: this.root, // !!!!!! PAY ATTENTION HERE
        depositRoot: depositRoot,
        proof: proof,
        proofPos: pos
    }
}
