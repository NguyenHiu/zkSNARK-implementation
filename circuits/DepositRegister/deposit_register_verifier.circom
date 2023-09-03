pragma circom  2.0.2;
include "../../node_modules/circomlib/circuits/mimc.circom";
include "../ECDSA/ecdsa.circom";

template convert64bitsArray() {
    // assume: valid input
    signal input a;
    signal output out[4];

    var tmp;
    var A = a;
    var e = 1<<64;
    for (var i = 0; i < 4; i++) {
        tmp = A % e;
        out[i] <-- tmp;
        A = A>>64;
    }
}

template Main(k, h) {
    /* Signals */
    // Public Signals
    signal input depositRegisterRoot_Onchain;
    signal input registerAccountRoot_Onchain;
    signal input oldAccountRoot_Onchain;
    // Private Signals
    signal input depositRegisterRoot;
    signal input registerAccountRoot;
    signal input oldAccountRoot;

    signal input newAccountRoot;
    signal input proof[k];
    signal input proofPos[k];

    signal input senderPubkeyX[4];
    signal input senderPubkeyY[4];
    signal input receiverPubkeyX[4];
    signal input receiverPubkeyY[4];
    signal input amount[4];
    signal input r[4];
    signal input s[4];
    signal input v[4];
    // output signals
    signal output out;

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

    depositRegisterRoot_Onchain === depositRegisterRoot;
    registerAccountRoot_Onchain === registerAccountRoot;
    oldAccountRoot_Onchain === oldAccountRoot;

    component signatureCheck[4];
    component converter[4][5];
    component msghash[4];
    for (var i = 0; i < 1; i++) {
        signatureCheck[i] = ECDSAVerifyNoPubkeyCheck(64, 4);
        /* input signals: r, s, msghash, pubkey*/ 
        // r
        converter[i][0] = convert64bitsArray();
        converter[i][0].a <== r[i];
        signatureCheck[i].r[0] <== converter[i][0].out[0];
        signatureCheck[i].r[1] <== converter[i][0].out[1];
        signatureCheck[i].r[2] <== converter[i][0].out[2];
        signatureCheck[i].r[3] <== converter[i][0].out[3];
        log(converter[i][0].out[0]);
        log(converter[i][0].out[1]);
        log(converter[i][0].out[2]);
        log(converter[i][0].out[3]);
        // s
        converter[i][1] = convert64bitsArray();
        converter[i][1].a <== s[i];
        signatureCheck[i].s[0] <== converter[i][1].out[0];
        signatureCheck[i].s[1] <== converter[i][1].out[1];
        signatureCheck[i].s[2] <== converter[i][1].out[2];
        signatureCheck[i].s[3] <== converter[i][1].out[3];
        log(converter[i][1].out[0]);
        log(converter[i][1].out[1]);
        log(converter[i][1].out[2]);
        log(converter[i][1].out[3]);
        // msghash
        msghash[i] = MultiMiMC7(6, 91);
        msghash[i].in[0] <== senderPubkeyX[i];
        msghash[i].in[1] <== senderPubkeyY[i];
        msghash[i].in[2] <== receiverPubkeyX[i];
        msghash[i].in[3] <== receiverPubkeyY[i];
        msghash[i].in[4] <== 0;
        msghash[i].in[5] <== amount[i];
        msghash[i].k <== 6;
        converter[i][2] = convert64bitsArray();
        converter[i][2].a <== msghash[i].out;
        signatureCheck[i].msghash[0] <== converter[i][2].out[0];
        signatureCheck[i].msghash[1] <== converter[i][2].out[1];
        signatureCheck[i].msghash[2] <== converter[i][2].out[2];
        signatureCheck[i].msghash[3] <== converter[i][2].out[3];
        log(converter[i][2].out[0]);
        log(converter[i][2].out[1]);
        log(converter[i][2].out[2]);
        log(converter[i][2].out[3]);
        // pubkey
        converter[i][3] = convert64bitsArray();
        converter[i][3].a <== senderPubkeyX[i];
        signatureCheck[i].pubkey[0][0] <== converter[i][3].out[0];
        signatureCheck[i].pubkey[0][1] <== converter[i][3].out[1];
        signatureCheck[i].pubkey[0][2] <== converter[i][3].out[2];
        signatureCheck[i].pubkey[0][3] <== converter[i][3].out[3];
        log(converter[i][3].out[0]);
        log(converter[i][3].out[1]);
        log(converter[i][3].out[2]);
        log(converter[i][3].out[3]);
        converter[i][4] = convert64bitsArray();
        converter[i][4].a <== senderPubkeyY[i];
        log(converter[i][4].out[0]);
        log(converter[i][4].out[1]);
        log(converter[i][4].out[2]);
        log(converter[i][4].out[3]);
        signatureCheck[i].pubkey[1][0] <== converter[i][4].out[0];
        signatureCheck[i].pubkey[1][1] <== converter[i][4].out[1];
        signatureCheck[i].pubkey[1][2] <== converter[i][4].out[2];
        signatureCheck[i].pubkey[1][3] <== converter[i][4].out[3];

        // log(signatureCheck[i].result);
    }

    // component mimcs1[k];
    // for (var i=0; i < k; i++) {
    //     mimcs1[i] = MultiMiMC7(2, 91);
    //     mimcs1[i].in[0] <== ((i==0) ? hash0List[h] : mimcs1[i-1].out) + proofPos[i] * (proof[i] - ((i==0) ? hash0List[h] : mimcs1[i-1].out));
    //     mimcs1[i].in[1] <== proof[i] + proofPos[i] * (((i==0) ? hash0List[h] : mimcs1[i-1].out) - proof[i]);
    //     mimcs1[i].k <== 2;
    // }
    // if (k == 0) {
    //     hash0List[h] === oldAccountRoot;
    // }
    // else {
    //     mimcs1[k-1].out === oldAccountRoot;
    // }

    // component mimcs2[k];
    // for (var i=0; i < k; i++) {
    //     mimcs2[i] = MultiMiMC7(2, 91);
    //     mimcs2[i].in[0] <== proof[i] + proofPos[i] * (((i==0) ? depositRegisterRoot : mimcs2[i-1].out) - proof[i]);
    //     mimcs2[i].in[1] <== ((i==0) ? depositRegisterRoot : mimcs2[i-1].out) + proofPos[i] * (proof[i] - ((i==0) ? depositRegisterRoot : mimcs2[i-1].out));
    //     mimcs2[i].k <== 2;
    // }
    // if (k == 0) {
    //     hash0List[h] === newAccountRoot;
    // }
    // else {
    //     mimcs2[k-1].out === newAccountRoot;
    // }

    // log("true");
}


component main {public [registerAccountRoot_Onchain, oldAccountRoot_Onchain, depositRegisterRoot_Onchain]}  = Main(1, 2);