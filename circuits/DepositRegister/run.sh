#!/bin/bash

BUILD_DIR=../../build/circuits/deposit_register_verifier
CIRCUIT_NAME=deposit_register_verifier
INPUT_DIR=../../build/inputs
INPUT_FILE=1_test_deposit_register_proof.json

if [ ! -d "$BUILD_DIR" ]; then
    echo "No build directory found. Creating build directory..."
    mkdir -p "$BUILD_DIR"
fi

echo "****COMPILING CIRCUIT****"
circom "$CIRCUIT_NAME".circom --r1cs --wasm --sym --c --wat --output "$BUILD_DIR"

echo "****GENERATING WITNESS FOR SAMPLE INPUT****"
node "$BUILD_DIR"/"$CIRCUIT_NAME"_js/generate_witness.js "$BUILD_DIR"/"$CIRCUIT_NAME"_js/"$CIRCUIT_NAME".wasm "$INPUT_DIR"/$INPUT_FILE "$BUILD_DIR"/witness.wtns

# echo "****GENERATING PTAU FILE****"
# # Powers of Tau 
# snarkjs powersoftau new bn128 12 "$BUILD_DIR"/pot12_0000.ptau -v
# snarkjs powersoftau contribute "$BUILD_DIR"/pot12_0000.ptau "$BUILD_DIR"/pot12_0001.ptau --name="First contribution" -v
# # Phase 2
# snarkjs powersoftau prepare phase2 "$BUILD_DIR"/pot12_0001.ptau "$BUILD_DIR"/pot12_final.ptau -v

# echo "****GENERATING ZKEY 0****"
# snarkjs groth16 setup "$BUILD_DIR"/"$CIRCUIT_NAME".r1cs "$BUILD_DIR"/pot12_final.ptau "$BUILD_DIR"/"$CIRCUIT_NAME"_0.zkey

# echo "****CONTRIBUTE TO THE PHASE 2 CEREMONY****"
# snarkjs zkey contribute "$BUILD_DIR"/"$CIRCUIT_NAME"_0.zkey "$BUILD_DIR"/"$CIRCUIT_NAME"_1.zkey --name="1st Contributor Name" -v

# echo "** Exporting vkey"
# snarkjs zkey export verificationkey "$BUILD_DIR"/"$CIRCUIT_NAME"_1.zkey "$BUILD_DIR"/verification_key.json

echo "****GENERATING PROOF FOR SAMPLE INPUT****"
snarkjs groth16 prove "$BUILD_DIR"/"$CIRCUIT_NAME"_1.zkey "$BUILD_DIR"/witness.wtns "$BUILD_DIR"/proof.json "$BUILD_DIR"/public.json

echo "****VERIFYING PROOF FOR SAMPLE INPUT****"
snarkjs groth16 verify "$BUILD_DIR"/verification_key.json "$BUILD_DIR"/public.json "$BUILD_DIR"/proof.json

# generate smart contract
mkdir -p "$BUILD_DIR"/smart_contract
snarkjs zkey export solidityverifier "$BUILD_DIR"/"$CIRCUIT_NAME"_1.zkey "$BUILD_DIR"/smart_contract/verifier.sol

snarkjs zkey export soliditycalldata "$BUILD_DIR"/public.json "$BUILD_DIR"/proof.json