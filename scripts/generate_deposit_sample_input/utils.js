const bigInt = require("snarkjs").bigInt;

exports.ZeroPrvKey = new Uint8Array([
    16, 10, 128, 66, 183, 37, 215, 35,
    179, 180, 153, 3, 93, 64, 205, 139,
    121, 119, 62, 94, 156, 246, 123, 215,
    173, 28, 194, 83, 123, 236, 120, 190
]);


exports.ZeroPubKeyX = new Uint8Array([
    37, 150, 3, 197, 80, 239, 118, 37,
    167, 89, 188, 69, 183, 194, 58, 227,
    49, 49, 197, 24, 129, 29, 183, 200,
    52, 164, 170, 164, 101, 160, 214, 25
]);


exports.ZeroPubKeyY = new Uint8Array([
    26, 96, 75, 249, 228, 205, 141, 163,
    34, 194, 150, 242, 29, 6, 251, 30,
    252, 233, 12, 181, 15, 165, 60, 1,
    215, 167, 115, 197, 45, 5, 212, 4
]);


exports.Empty = [
    new Uint8Array([
        209, 107, 35, 20, 91, 63, 241, 54,
        164, 103, 50, 91, 173, 173, 12, 194,
        197, 216, 234, 96, 78, 208, 220, 155,
        119, 218, 231, 163, 40, 213, 241, 25
    ]),
    new Uint8Array([
        18, 160, 73, 81, 241, 193, 137, 152,
        44, 95, 2, 51, 26, 219, 205, 112,
        12, 104, 42, 148, 106, 20, 61, 43,
        244, 216, 139, 183, 66, 97, 21, 22
    ]),
    new Uint8Array([
        97, 183, 3, 153, 26, 91, 117, 69,
        244, 120, 252, 25, 37, 65, 42, 174,
        164, 240, 59, 5, 154, 187, 22, 127,
        82, 33, 36, 187, 202, 166, 157, 0
    ]),
    new Uint8Array([
        35, 56, 84, 181, 254, 143, 1, 249,
        122, 211, 146, 195, 193, 181, 42, 28,
        195, 66, 57, 250, 222, 52, 59, 155,
        4, 230, 192, 157, 38, 23, 177, 5
    ]),
    new Uint8Array([
        54, 17, 162, 164, 195, 143, 150, 234,
        36, 178, 85, 21, 157, 101, 137, 101,
        93, 235, 16, 249, 163, 79, 99, 219,
        172, 54, 231, 3, 123, 135, 93, 11
    ]),
    new Uint8Array([
        34, 188, 23, 127, 68, 138, 29, 54,
        30, 46, 203, 148, 133, 12, 200, 241,
        241, 110, 20, 244, 135, 55, 132, 224,
        107, 15, 243, 221, 185, 151, 0, 38
    ]),
    new Uint8Array([
        101, 214, 17, 202, 13, 141, 79, 139,
        52, 44, 71, 194, 226, 16, 182, 77,
        240, 145, 100, 135, 203, 125, 136, 96,
        134, 179, 252, 21, 12, 199, 4, 12
    ]),
    new Uint8Array([
        244, 23, 88, 4, 78, 49, 25, 246,
        146, 223, 216, 205, 45, 56, 246, 158,
        70, 220, 30, 51, 47, 143, 133, 187,
        120, 250, 32, 132, 104, 95, 177, 27
    ]),
    new Uint8Array([
        104, 98, 68, 218, 222, 98, 88, 113,
        243, 220, 218, 244, 72, 254, 107, 24,
        51, 101, 59, 121, 191, 29, 233, 211,
        167, 185, 49, 17, 174, 63, 201, 4
    ]),
    new Uint8Array([
        202, 131, 231, 45, 220, 209, 90, 14,
        206, 45, 201, 195, 174, 53, 78, 247,
        91, 19, 153, 158, 64, 94, 27, 36,
        61, 95, 80, 44, 10, 254, 79, 22
    ]),
    new Uint8Array([
        115, 236, 218, 100, 28, 78, 131, 57,
        158, 126, 236, 105, 25, 19, 144, 205,
        79, 219, 58, 112, 84, 199, 29, 248,
        247, 45, 254, 47, 41, 167, 116, 13
    ])
];

exports.isEqual = function (x, y) {
    if (x.length != y.length)
        return false;
    return x.every((value, index) => value == y[index]);
};

function bigIntToUint8Array32(num) {
    const each = bigInt(1).shl(8);
    const arr = [];
    while (num.greater(bigInt(0))) {
        arr.push(parseInt(num.mod(each)));
        num = num.shr(8);
    }
    while (arr.length < 32)
        arr.push(0); 
    return new Uint8Array(arr);
}
exports.bigIntToUint8Array32 = (num) => bigIntToUint8Array32(num);


function bigIntToUint8Array(num) {
    const each = bigInt(1).shl(8);
    const arr = [];
    while (num.greater(bigInt(0))) {
        arr.push(parseInt(num.mod(each)));
        num = num.shr(8);
    }
    const _arr = []
    for (let i = arr.length-1; i >= 0; --i)
        _arr.push(arr[i])
    return new Uint8Array(_arr);
}
exports.bigIntToUint8Array = (num) => bigIntToUint8Array(num);

function uint8ArrayToBigInt(arr) {
    // if (Array.isArray(arr)) {
    //     return arr.map(x => uint8ArrayToBigInt(x, mimc));
    // }
    // return mimc.F.toString(arr);
    let result = bigInt(0);
    for (let i = 0; i < arr.length; ++i) {
    // for (let i = arr.length-1; i >= 0; --i) {
        result = bigInt.add(bigInt.mul(result, bigInt(256)), bigInt(arr[i]))
    }
    return result;
};
exports.uint8ArrayToBigInt = (arr, mimc) => uint8ArrayToBigInt(arr, mimc);

function parseSignatureFromUint8Array(_signature) {
    return {
        r: _signature.slice(0, 32),
        s: _signature.slice(32)
    }
}
exports.parseSignatureFromUint8Array = (_signature) => parseSignatureFromUint8Array(_signature);

function uint8ArrayTo64BitsArray(uint8array) {
    let num = bigInt(0);
    for (let i = 0; i < uint8array.length; ++i) {
        num = bigInt.add(bigInt.mul(num, bigInt(256)), bigInt(uint8array[i]))
    }
    
    return bigIntNumTo64BitsArray(num);
}
exports.uint8ArrayTo64BitsArray = (uint8array) => uint8ArrayTo64BitsArray(uint8array);

function bigIntNumTo64BitsArray(num) {
    const res = [];
    const each = bigInt(1).shl(64);
    while (num.greater(bigInt(0))) {
        res.push(num.mod(each).toString());
        num = num.shr(64);
    }
    return res;
}
exports.bigIntNumTo64BitsArray = (num) => bigIntNumTo64BitsArray(num);

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