pragma circom  2.0.2;
include "../../node_modules/circomlib/circuits/mimc.circom";

template Main() {
    signal input a;
    signal input b;
    signal input c;
    signal input d;
    signal input e;

    component MultiMiMC7 = MultiMiMC7(5, 91);
    MultiMiMC7.in[0] <== a;
    MultiMiMC7.in[1] <== b;
    MultiMiMC7.in[2] <== c;
    MultiMiMC7.in[3] <== d;
    MultiMiMC7.in[4] <== e;
    MultiMiMC7.k <== 5;

    log(MultiMiMC7.out);
}

component main  = Main();