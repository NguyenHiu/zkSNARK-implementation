pragma circom  2.0.2;
include "../../node_modules/circomlib/circuits/eddsamimc.circom";

// D: account tree depth
// d: new account tree depth
template Main(D, d) {
    var noNewAccount = 2**d;
    var D_d = D-d;

    /* Signals */
    // Public Signals
    signal input depositRegisterRoot;
    signal input registerAccountRoot;
    signal input oldAccountRoot;
    signal input newAccountRoot;

    // Private Signals
    signal input proofExistEmptySubTree[D_d];
    signal input proofPosExistEmptySubTree[D_d];

    signal input senderPubkeyX[noNewAccount];
    signal input senderPubkeyY[noNewAccount];
    signal input receiverPubkeyX[noNewAccount];
    signal input receiverPubkeyY[noNewAccount];
    signal input amount[noNewAccount];
    signal input R8X[noNewAccount];
    signal input R8Y[noNewAccount];
    signal input S[noNewAccount];
    signal input proofTxExist[noNewAccount][d];
    signal input proofPosTxExist[noNewAccount][d];

    // variables
    var hash0List[10] = [
        1573324186036448713481346981587450647264984233512279814663328547409663481937,
        9221018895050993324292303320438868939233722601173553706050470331080290750693,
        12999365443651442215514895308017834519512617414559443468873955037117958277416,
        20000342084434355373885637637578843870879198134980505504746864372412689521413,
        21131570394556002839255503091195735945490554868211137009219364774137823738322,
        6641720650120903822738321354484653400594044929628658080119759607253877941163,
        17934353524240691345766712740369447790455352429584677216942906113774579929243,
        4792376650332574253220644164029478246267631554842952771122075147151438494199,
        21003074257506404549439079356060811589472268388178763634295358398690127726232,
        6984959195455514022151545760850437139389537397033278595432294845838845639909
    ];

    // Check Signature & the existence of transactions
    component signatureCheck[noNewAccount];
    component converter[noNewAccount];
    component msghash[noNewAccount];
    component proofExistTxHash[noNewAccount][d];
    for (var i = 0; i < noNewAccount; i++) {
        // hash transaction
        msghash[i] = MultiMiMC7(6, 91);
        msghash[i].in[0] <== senderPubkeyX[i];
        msghash[i].in[1] <== senderPubkeyY[i];
        msghash[i].in[2] <== receiverPubkeyX[i];
        msghash[i].in[3] <== receiverPubkeyY[i];
        msghash[i].in[4] <== 0;
        msghash[i].in[5] <== amount[i];
        msghash[i].k <== 6;

        // check signature
        signatureCheck[i] = EdDSAMiMCVerifier();
        signatureCheck[i].enabled <== 1;
        signatureCheck[i].Ax <== senderPubkeyX[i];
        signatureCheck[i].Ay <== senderPubkeyY[i];
        signatureCheck[i].S <== S[i];
        signatureCheck[i].R8x <== R8X[i];
        signatureCheck[i].R8y <== R8Y[i];
        signatureCheck[i].M <== msghash[i].out;

        // check transaction proof
        for (var j = 0; j < d; j++) {
            proofExistTxHash[i][j] = MultiMiMC7(2, 91);
            proofExistTxHash[i][j].in[0] <== proofTxExist[i][j] + proofPosTxExist[i][j] * (((j == 0) ? msghash[i].out : proofExistTxHash[i][j-1].out) - proofTxExist[i][j]);
            proofExistTxHash[i][j].in[1] <== ((j == 0) ? msghash[i].out : proofExistTxHash[i][j-1].out) +  proofPosTxExist[i][j] * (proofTxExist[i][j] - ((j == 0) ? msghash[i].out : proofExistTxHash[i][j-1].out));
            proofExistTxHash[i][j].k <== 2;
        }
        depositRegisterRoot === proofExistTxHash[i][d-1].out;
        
    }

    /* Exist Empty Sub for new Account Tree ?  */
    component existSubTreeHash[D_d];
    for (var i = 0; i < D_d ; i++) {
        existSubTreeHash[i] = MultiMiMC7(2, 91);
        existSubTreeHash[i].in[0] <== proofExistEmptySubTree[i] + proofPosExistEmptySubTree[i] * (((i == 0) ? hash0List[2] : existSubTreeHash[i-1].out) - proofExistEmptySubTree[i]);
        existSubTreeHash[i].in[1] <== ((i == 0) ? hash0List[2] : existSubTreeHash[i-1].out) + proofPosExistEmptySubTree[i] * (proofExistEmptySubTree[i] - ((i == 0) ? hash0List[2] : existSubTreeHash[i-1].out));
        existSubTreeHash[i].k <== 2;
    }
    existSubTreeHash[D_d-1].out === oldAccountRoot;

    /* Check new Account Root */
    component newAccountRootHash[D_d];
    for (var i = 0; i < D_d ; i++) {
        newAccountRootHash[i] = MultiMiMC7(2, 91);
        newAccountRootHash[i].in[0] <== proofExistEmptySubTree[i] + proofPosExistEmptySubTree[i] * (((i == 0) ? registerAccountRoot : newAccountRootHash[i-1].out) - proofExistEmptySubTree[i]);
        newAccountRootHash[i].in[1] <== ((i == 0) ? registerAccountRoot : newAccountRootHash[i-1].out) + proofPosExistEmptySubTree[i] * (proofExistEmptySubTree[i] - ((i == 0) ? registerAccountRoot : newAccountRootHash[i-1].out));
        newAccountRootHash[i].k <== 2;
    }
    newAccountRootHash[D_d-1].out === newAccountRoot;
}


component main {public [registerAccountRoot, oldAccountRoot, depositRegisterRoot, newAccountRoot]}  = Main(3, 2);