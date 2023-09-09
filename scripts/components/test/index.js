const buildMimc7 = require("circomlibjs").buildMimc7;
const buildEddsa = require("circomlibjs").buildEddsa;
const snarkjs = require("snarkjs");
const fs = require("fs");

function createUserL2(prvkey_hex, mimc, eddsa) {
    const _prvkey_uint8array = mimc.F.e(prvkey_hex, 16);
    const pubkey_Ed = eddsa.prv2pub(_prvkey_uint8array);
    return {
        prvkey: _prvkey_uint8array,
        pubkeyX: pubkey_Ed[0],
        pubkeyY: pubkey_Ed[1]
    }
}


async function run() {
    const mimc = await buildMimc7();
    const eddsa = await buildEddsa();

    let x = 10;
    console.log(mimc.F.toString(x));
    console.log(mimc.F.e(x));
    console.log(mimc.F.toString(mimc.F.e(x)));

    // const A_privateKey = uint8Array2Hex(new Uint8Array(new Array(32).fill(0)));
    // const B_privateKey = uint8Array2Hex(new Uint8Array(new Array(32).fill(1)));

    // const A = createUserL2(A_privateKey, mimc, eddsa);
    // const B = createUserL2(B_privateKey, mimc, eddsa);

    // console.log(mimc.F.toString(A.pubkeyX));
    // console.log(mimc.F.toString(A.pubkeyY));

    // const msg = new Uint8Array(new Array(32).fill(2));
    // const sign = eddsa.signMiMC(A.prvkey, msg);
    // const input = {
    //     R8X: mimc.F.toString(sign.R8[0]),
    //     R8Y: mimc.F.toString(sign.R8[1]),
    //     S: mimc.F.toString(mimc.F.e(sign.S)),
    //     msg: mimc.F.toString(msg),
    //     pX: mimc.F.toString(A.pubkeyX),
    //     pY: mimc.F.toString(A.pubkeyY)
    // }
    // console.log(sign);

    // const json_parse = JSON.stringify(input)

    // fs.writeFile(
    //     "../../build/inputs/test.json",
    //     json_parse,
    //     'utf-8',
    //     () => { });

    // const inputPath = "../../build/inputs/1_test_deposit_register_proof.json";
    // const input = JSON.parse(fs.readFileSync(inputPath));
    // // console.log("input: ", input);
    // const wasm = "../../build/circuits/deposit_register_verifier/deposit_register_verifier_js/deposit_register_verifier.wasm";
    // const zkey = "../../build/circuits/deposit_register_verifier/deposit_register_verifier_1.zkey"
    // const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasm, zkey);
    // console.log("proof: ", proof);
    // console.log("publicSignals: ", publicSignals);
    // const rawCallData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    // const jsonCallData = rawCallData.split(',');
    // console.log(jsonCallData);
}

run();