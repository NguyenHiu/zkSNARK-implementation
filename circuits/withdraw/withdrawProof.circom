pragma circom  2.0.2;
include "../../node_modules/circomlib/circuits/eddsamimc.circom";

// l: the number of withdraw transaction
// d: depth of withdraw tree
// D: depth of account tree
template Main(l, d, D) {

    /* Signals */
    // Public Signals
    signal input withdrawTreeRoot;
    signal input oldAccountRoot;
    signal input newAccountRoot;

    // Private Signals
    signal input intermediateRoot[l];
    signal input senderPubkeyX[l];
    signal input senderPubkeyY[l];
    signal input nonce[l];
    signal input balance[l];
    signal input amount[l];
    signal input R8X[l];
    signal input R8Y[l];
    signal input S[l];
    signal input proofSenderExists[l][D];
    signal input proofPosSenderExists[l][D];
    signal input proofTxExist[l][d];
    signal input proofPosTxExist[l][d];

    component txHash[l];
    component accountHash[l];
    component existenceAccountCheck[l][D];
    component accountHashNewState[l];
    component existenceAccountCheckNewState[l][D];
    component signatureCheck[l];
    component existenceTxCheck[l][d];

    var currentIntermediateRoot = oldAccountRoot;
    for (var i = 0; i < l; i++) {   
        // hash account
        accountHash[i] = MultiMiMC7(4, 91);
        accountHash[i].in[0] <== senderPubkeyX[i];
        accountHash[i].in[1] <== senderPubkeyY[i];
        accountHash[i].in[2] <== balance[i];
        accountHash[i].in[3] <== nonce[i];
        accountHash[i].k <== 4;
        
        // check account exists 
        for (var j = 0; j < D; j++) {
            existenceAccountCheck[i][j] = MultiMiMC7(2, 91);
            existenceAccountCheck[i][j].in[0] <== 
                proofSenderExists[i][j] + 
                proofPosSenderExists[i][j] * (
                    ((j == 0) ? accountHash[i].out : existenceAccountCheck[i][j-1].out) - 
                    proofSenderExists[i][j]
                );

            existenceAccountCheck[i][j].in[1] <== 
                ((j == 0) ? accountHash[i].out : existenceAccountCheck[i][j-1].out) +  
                proofPosSenderExists[i][j] * 
                    (
                        proofSenderExists[i][j] - 
                        ((j == 0) ? accountHash[i].out : existenceAccountCheck[i][j-1].out)
                    );

            existenceAccountCheck[i][j].k <== 2;
        }
        currentIntermediateRoot === existenceAccountCheck[i][D-1].out;

        // hash transaction
        txHash[i] = MultiMiMC7(6, 91);
        txHash[i].in[0] <== senderPubkeyX[i];
        txHash[i].in[1] <== senderPubkeyY[i];
        txHash[i].in[2] <== 0;
        txHash[i].in[3] <== 0;
        txHash[i].in[4] <== 0;
        txHash[i].in[5] <== amount[i];
        txHash[i].k <== 6;

        // check signature
        signatureCheck[i] = EdDSAMiMCVerifier();
        signatureCheck[i].enabled <== 1;
        signatureCheck[i].Ax <== senderPubkeyX[i];
        signatureCheck[i].Ay <== senderPubkeyY[i];
        signatureCheck[i].S <== S[i];
        signatureCheck[i].R8x <== R8X[i];
        signatureCheck[i].R8y <== R8Y[i];
        signatureCheck[i].M <== txHash[i].out;

        // check transaction exists
        for (var j = 0; j < d; j++) {
            existenceTxCheck[i][j] = MultiMiMC7(2, 91);
            existenceTxCheck[i][j].in[0] <== 
                proofTxExist[i][j] + 
                proofPosTxExist[i][j] * (
                    ((j == 0) ? txHash[i].out : existenceTxCheck[i][j-1].out) - 
                    proofTxExist[i][j]
                );

            existenceTxCheck[i][j].in[1] <== 
                ((j == 0) ? txHash[i].out : existenceTxCheck[i][j-1].out) +  
                proofPosTxExist[i][j] * 
                    (
                        proofTxExist[i][j] - 
                        ((j == 0) ? txHash[i].out : existenceTxCheck[i][j-1].out)
                    );

            existenceTxCheck[i][j].k <== 2;
        }
        withdrawTreeRoot === existenceTxCheck[i][d-1].out;


        // process transaction
        // hash account in new state
        accountHashNewState[i] = MultiMiMC7(4, 91);
        accountHashNewState[i].in[0] <== senderPubkeyX[i];
        accountHashNewState[i].in[1] <== senderPubkeyY[i];
        accountHashNewState[i].in[2] <== balance[i]-amount[i];
        accountHashNewState[i].in[3] <== nonce[i]+1;
        accountHashNewState[i].k <== 4;

        // check account exists in intermediate tree
        for (var j = 0; j < D; j++) {
            existenceAccountCheckNewState[i][j] = MultiMiMC7(2, 91);
            existenceAccountCheckNewState[i][j].in[0] <== 
                proofSenderExists[i][j] + 
                proofPosSenderExists[i][j] * (
                    ((j == 0) ? accountHashNewState[i].out : existenceAccountCheckNewState[i][j-1].out) - 
                    proofSenderExists[i][j]
                );

            existenceAccountCheckNewState[i][j].in[1] <== 
                ((j == 0) ? accountHashNewState[i].out : existenceAccountCheckNewState[i][j-1].out) +  
                proofPosSenderExists[i][j] * 
                    (
                        proofSenderExists[i][j] - 
                        ((j == 0) ? accountHashNewState[i].out : existenceAccountCheckNewState[i][j-1].out)
                    );

            existenceAccountCheckNewState[i][j].k <== 2;
        }
        intermediateRoot[i] === existenceAccountCheckNewState[i][D-1].out;
        currentIntermediateRoot = intermediateRoot[i];
    }

    newAccountRoot === currentIntermediateRoot;
    newAccountRoot === intermediateRoot[l-1];
}


component main {public [withdrawTreeRoot, oldAccountRoot, newAccountRoot]}  = Main(4, 2, 3);