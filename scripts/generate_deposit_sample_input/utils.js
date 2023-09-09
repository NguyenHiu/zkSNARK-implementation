const { ethers } = require("ethers");

exports.ZeroPrvKey = new Uint8Array([200, 252, 143, 245, 64, 244, 242, 122, 139, 45, 110, 187, 160, 82, 116, 248, 63, 96, 239, 99, 72, 198, 243, 46, 84, 224, 129, 83, 130, 72, 70, 33])
exports.ZeroPubKeyX = new Uint8Array([201, 149, 139, 10, 119, 112, 41, 215, 16, 63, 91, 210, 168, 82, 19, 36, 133, 85, 167, 128, 29, 89, 227, 70, 245, 153, 108, 54, 114, 153, 213, 163])
exports.ZeroPubKeyY = new Uint8Array([148, 4, 20, 67, 49, 217, 73, 245, 254, 20, 124, 62, 132, 132, 47, 223, 189, 239, 5, 132, 56, 162, 136, 78, 66, 73, 122, 188, 237, 226, 119, 169])
exports.Empty = [
    new Uint8Array([117, 116, 100, 176, 163, 96, 246, 237, 85, 160, 46, 29, 196, 95, 132, 146, 26, 13, 247, 54, 192, 117, 39, 236, 147, 170, 204, 79, 44, 223, 161, 15]),
    new Uint8Array([138, 71, 213, 77, 58, 68, 121, 183, 243, 5, 132, 181, 134, 184, 128, 29, 121, 187, 117, 1, 226, 112, 231, 110, 38, 210, 101, 40, 199, 244, 51, 32]),
    new Uint8Array([17, 99, 215, 186, 32, 62, 247, 14, 115, 87, 212, 218, 179, 28, 186, 245, 54, 168, 23, 122, 255, 47, 108, 249, 61, 174, 64, 20, 251, 201, 203, 19]),
    new Uint8Array([165, 253, 230, 129, 13, 115, 207, 219, 44, 36, 141, 95, 13, 155, 104, 54, 223, 238, 123, 3, 241, 166, 88, 206, 124, 100, 5, 103, 140, 59, 112, 41]),
    new Uint8Array([199, 179, 169, 148, 179, 31, 7, 191, 203, 12, 161, 68, 245, 164, 238, 156, 13, 232, 158, 149, 183, 53, 89, 192, 81, 16, 108, 43, 172, 28, 58, 24]),
    new Uint8Array([232, 184, 60, 87, 46, 97, 81, 211, 201, 38, 60, 53, 115, 80, 90, 223, 186, 9, 175, 121, 2, 213, 250, 38, 116, 76, 109, 202, 72, 65, 128, 20]),
    new Uint8Array([61, 168, 44, 55, 97, 197, 210, 19, 77, 144, 245, 43, 137, 34, 178, 140, 32, 56, 44, 184, 20, 200, 20, 240, 55, 223, 152, 238, 246, 120, 170, 22]),
    new Uint8Array([23, 169, 242, 167, 251, 70, 210, 227, 93, 111, 120, 254, 69, 215, 112, 49, 176, 219, 170, 62, 192, 244, 50, 167, 143, 130, 147, 192, 196, 171, 21, 24]),
    new Uint8Array([233, 78, 24, 172, 81, 106, 113, 74, 202, 80, 97, 163, 89, 88, 57, 193, 9, 163, 123, 199, 175, 136, 181, 142, 226, 177, 128, 159, 210, 94, 13, 29]),
    new Uint8Array([122, 204, 109, 187, 127, 194, 160, 61, 116, 175, 197, 206, 129, 27, 86, 97, 44, 18, 175, 110, 175, 115, 180, 97, 146, 112, 108, 88, 58, 179, 2, 31])
]

exports.isEqual = function (x, y) {
    if (x.length != y.length)
        return false;
    return x.every((value, index) => value == y[index]);
};


exports.createUserL1 = (prvkey_hex, mimc) => {
    const wallet = new ethers.Wallet(prvkey_hex);
    return wallet;
}

exports.createUserL2 = (prvkey_hex, mimc, eddsa) => {
    const _prvkey_uint8array = mimc.F.e(prvkey_hex, 16);
    const pubkey_Ed = eddsa.prv2pub(_prvkey_uint8array);
    return {
        prvkey: _prvkey_uint8array,
        pubkeyX: pubkey_Ed[0],
        pubkeyY: pubkey_Ed[1]
    }
}

function hex2Uint8Array(hex, l) {
    const arr = [];
    if ((hex.length > 2) && (hex.slice(0, 2) == "0x")) {
        hex = hex.slice(2);
    }
    if (hex.length == 63) hex = "0" + hex;
    hex.match(/.{1,2}/g).map(x => arr.push(parseInt(x, 16)));
    while (arr.length < l)
        arr.push(0);
    return new Uint8Array(arr);
}
exports.hex2Uint8Array = (hex, l = 32) => hex2Uint8Array(hex, l);

function uint8Array2Hex(uint8array) {
    let hex = "0x";
    for (let i = 0; i < uint8array.length; ++i) {
        hex += uint8array[i].toString(16).padStart(2, "0");
    }
    return hex;
}
exports.uint8Array2Hex = (uint8array) => uint8Array2Hex(uint8array);

function uint8Array2BigIntString(uint8array) {
    return BigInt(uint8Array2Hex(uint8array), 16).toString();
}
exports.uint8Array2BigIntString = (uint8array) => uint8Array2BigIntString(uint8array);

function hex2BigIntString(hex) {
    return BigInt(hex, 16).toString();
}

function uint8Array2uint64Array(uint8array) {
    let num = BigInt(uint8Array2Hex(uint8array), 16);
    const _64bitarray = [];
    const e = BigInt(1) << BigInt(64);
    while (num > BigInt(0)) {
        _64bitarray.push((num % e).toString());
        num = num >> BigInt(64);
    }
    return _64bitarray;
}
exports.uint8Array2uint64Array = (uint8array) => uint8Array2uint64Array(uint8array);

exports.getDepositRegisterInputCircuit = function (state, mimc) {
    const txDepositTree = state.txDepositTree;
    const txs = txDepositTree.txs;
    const noTx = txs.length;

    // check valid transaction (valid signature)
    const senderPubkeyX = new Array(noTx);
    const senderPubkeyY = new Array(noTx);
    const receiverPubkeyX = new Array(noTx);
    const receiverPubkeyY = new Array(noTx);
    const amount = new Array(noTx);
    const R8X = new Array(noTx);
    const R8Y = new Array(noTx);
    const S = new Array(noTx);
    const proofTxExist = new Array(noTx);
    const proofPosTxExist = new Array(noTx);

    for (let i = 0; i < noTx; ++i) {
        senderPubkeyX[i] = mimc.F.toString(txs[i].fromX);
        senderPubkeyY[i] = mimc.F.toString(txs[i].fromY);
        receiverPubkeyX[i] = mimc.F.toString(txs[i].toX);
        receiverPubkeyY[i] = mimc.F.toString(txs[i].toY);
        amount[i] = mimc.F.toString(txs[i].amount);
        R8X[i] = mimc.F.toString(txs[i].R8X);
        R8Y[i] = mimc.F.toString(txs[i].R8Y);
        S[i] = txs[i].S.toString();

        const { proof, proofPos } = txDepositTree.getProof(i);
        const _convertProof = [];
        proof.map(x => _convertProof.push(mimc.F.toString(x)));
        proofTxExist[i] = _convertProof;
        proofPosTxExist[i] = proofPos;
    }

    const proofExistEmptySubTree = [];
    for (let i = 0; i < state.proofExistEmptySubTree.length; ++i) {
        proofExistEmptySubTree.push(mimc.F.toString(state.proofExistEmptySubTree[i]));
    }


    return {
        oldAccountRoot: mimc.F.toString(state.oldAccountRoot),
        depositRegisterRoot: mimc.F.toString(state.txDepositTree.root),
        registerAccountRoot: mimc.F.toString(state.registerAccountTree.root),

        newAccountRoot: mimc.F.toString(state.newAccountRoot),
        proofExistEmptySubTree: proofExistEmptySubTree,
        proofPosExistEmptySubTree: state.proofPosExistEmptySubTree,
        senderPubkeyX: senderPubkeyX,
        senderPubkeyY: senderPubkeyY,
        receiverPubkeyX: receiverPubkeyX,
        receiverPubkeyY: receiverPubkeyY,
        amount: amount,
        R8X: R8X,
        R8Y: R8Y,
        S: S,
        proofTxExist: proofTxExist,
        proofPosTxExist: proofPosTxExist
    }
}

exports.getDepositExistenceInputCircuit = function (processState) {
    /* 
    processState {
        currentAccountRoot: currentAccountRoot,
        txRree: txTree,
        txProofs: txExistenceProofs,
        txProofPos: txExistenceProofPos,
        txDetails: txDetails
    }
    */

    const txTree = processState.txTree;
    const noTx = txTree.txs.length;

    const txExistenceProof = new Array(noTx);
    const txExistenceProofPos = new Array(noTx);
    const senderExistenceProof = new Array(noTx);
    const senderExistenceProofPos = new Array(noTx);
    const senderPubkeyX = new Array(noTx);
    const senderPubkeyY = new Array(noTx);
    const senderBalance = new Array(noTx);
    const senderNonce = new Array(noTx);
    const receiverExistenceProof = new Array(noTx);
    const receiverExistenceProofPos = new Array(noTx);
    const receiverPubkeyX = new Array(noTx);
    const receiverPubkeyY = new Array(noTx);
    const receiverBalance = new Array(noTx);
    const receiverNonce = new Array(noTx);
    const r = new Array(noTx);
    const s = new Array(noTx);
    const amount = new Array(noTx);
    const intermediateRoots = new Array(2 * noTx + 1);

    intermediateRoots[0] = processState.currentAccountRoot;
    for (let i = 0; i < txTree.txs.length; ++i) {
        txExistenceProof[i] = processState.txProofs[i];
        txExistenceProofPos[i] = processState.txProofPos[i];
        senderPubkeyX[i] = processState.txTree.txs[i].fromX;
        senderPubkeyY[i] = processState.txTree.txs[i].fromY;
        senderBalance[i] = processState.txDetails[i].senderBalance;
        senderNonce[i] = processState.txDetails[i].senderNonce;
        senderExistenceProof[i] = processState.txDetails[i].senderProof;
        senderExistenceProofPos[i] = processState.txDetails[i].senderProofPos;
        receiverPubkeyX[i] = processState.txTree.txs[i].toX;
        receiverPubkeyY[i] = processState.txTree.txs[i].toY;
        receiverBalance[i] = processState.txDetails[i].receiverBalance;
        receiverNonce[i] = processState.txDetails[i].receiverNonce;
        receiverExistenceProof[i] = processState.txDetails[i].receiverProof;
        receiverExistenceProofPos[i] = processState.txDetails[i].receiverProofPos;
        r[i] = processState.txTree.txs[i].r;
        s[i] = processState.txTree.txs[i].s;
        amount[i] = processState.txTree.txs[i].amount;
        intermediateRoots[1 + 2 * i] = processState.txDetails[i].senderIntermediateRoot,
            intermediateRoots[2 + 2 * i] = processState.txDetails[i].receiverIntermediateRoot
    }

    return {
        txRoot: txTree.root,

        // prove transactions in txTree are existed
        txExistenceProof: txExistenceProof,
        txExistenceProofPos: txExistenceProofPos,

        // prove senders are existed
        senderExistenceProof: senderExistenceProof,
        senderExistenceProofPos: senderExistenceProofPos,
        senderPubkeyX: senderPubkeyX,
        senderPubkeyY: senderPubkeyY,
        senderBalance: senderBalance,
        senderNonce: senderNonce,
        receiverExistenceProof: receiverExistenceProof,
        receiverExistenceProofPos: receiverExistenceProofPos,
        receiverPubkeyX: receiverPubkeyX,
        receiverPubkeyY: receiverPubkeyY,
        receiverBalance: receiverBalance,
        receiverNonce: receiverNonce,

        // prove transactions is valid (signature)
        r: r,
        s: s,

        // provide information to calculate new state
        amount: amount,

        // provide all the intermediate roots
        intermediateRoots: intermediateRoots
    }


    /* 
    
    return {
        txTreeRoot,
        proofs --> transactions are existed in txTree: 
            proof,
            proofPos,

        proofs --> senders and receivers in transactions are existed in account tree: 
            proof, 
            proofPos,
            public key of sender and receiver,
            signature to prove the transaction is valid,
            balance before processing tx of senders and receivers,
            nonce before processing tx of senders and receivers



        amount of each tx
        
        all of the intermediate root when processing

    }

    */


};