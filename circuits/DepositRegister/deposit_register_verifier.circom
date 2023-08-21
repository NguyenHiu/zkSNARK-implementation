pragma circom  2.0.2;
include "../../node_modules/circomlib/circuits/mimc.circom";

template Main(k, h) {

    signal input depositRegisterOnchainRoot;
    signal input depositRegisterRoot;
    signal input newAccountRoot;
    signal input oldAccountRoot;
    signal input proof[k];
    signal input proofPos[k];

    signal output out;

    var hash0List[10] = [
        19734207751487574965357347449940542904053732874523152281331330631511355612191,
        2512825614926250775960674703066410486613867104193739155003583043104871095874,
        11799643647705317154616619603086829038559552118706826318841164154918071348413,
        15398482197331559150304322103114873337054115856408636421855262735732916090064,
        19974889592745776741868224246702745240240875193852835980454222791244489183060,
        12953077376831965104620935664095952114246363749614106927781243557641341910135,
        5605932935918700001148796439277322978570818802855348829092975408708975685045,
        6064410128596694637521487549311868959961007789852862914265793707579947582941,
        1408782887963725801343804974264308541215287239276159135468633614884810755976,
        6147957652049609742506802061377136715901537958848339258281190580166457412696
    ];

    depositRegisterOnchainRoot === depositRegisterRoot;

    component mimcs1[k];
    for (var i=0; i < k; i++) {
        mimcs1[i] = MultiMiMC7(2, 91);
        mimcs1[i].in[0] <== proof[i] + proofPos[i] * (((i==0) ? hash0List[h] : mimcs1[i-1].out) - proof[i]);
        mimcs1[i].in[1] <== ((i==0) ? hash0List[h] : mimcs1[i-1].out) + proofPos[i] * (proof[i] - ((i==0) ? hash0List[h] : mimcs1[i-1].out));
        mimcs1[i].k <== 2;
    }
    if (k == 0) {
        hash0List[h] === oldAccountRoot;
    }
    else {
        mimcs1[k-1].out === oldAccountRoot;
    }

    component mimcs2[k];
    for (var i=0; i < k; i++) {
        mimcs2[i] = MultiMiMC7(2, 91);
        mimcs2[i].in[0] <== proof[i] + proofPos[i] * (((i==0) ? depositRegisterRoot : mimcs2[i-1].out) - proof[i]);
        mimcs2[i].in[1] <== ((i==0) ? depositRegisterRoot : mimcs2[i-1].out) + proofPos[i] * (proof[i] - ((i==0) ? depositRegisterRoot : mimcs2[i-1].out));
        mimcs2[i].k <== 2;
    }
    if (k == 0) {
        hash0List[h] === newAccountRoot;
    }
    else {
        mimcs2[k-1].out === newAccountRoot;
    }

    log("true");
}


component main = Main(1, 2);