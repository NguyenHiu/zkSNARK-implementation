pragma circom  2.0.2;
include "../../node_modules/circomlib/circuits/mimc.circom";

template Main() {
    signal input a;
    signal input b;

    component MultiMiMC7 = MultiMiMC7(2, 91);
    MultiMiMC7.in[0] <== a;
    MultiMiMC7.in[1] <== b;
    MultiMiMC7.k <== 2;

    log(MultiMiMC7.out);
}

component main  = Main();