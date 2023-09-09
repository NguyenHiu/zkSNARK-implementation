pragma circom  2.0.2;
include "../../node_modules/circomlib/circuits/eddsamimc.circom";


template Main() {
    signal input R8X;
    signal input R8Y;
    signal input S;
    signal input msg;
    signal input pX;
    signal input pY;

    component x = EdDSAMiMCVerifier();
    x.enabled <== 1;
    x.Ax <== pX;
    x.Ay <== pY;
    x.S <== S;
    x.R8x <== R8X;
    x.R8y <== R8Y;
    x.M <== msg;
}

component main  = Main();