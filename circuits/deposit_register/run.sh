#!/bin/bash

BUILD_DIR=../../build/circuits/deposit_register_verifier
CIRCUIT_NAME=deposit_register_verifier
INPUT_DIR=../../build/inputs
INPUT_FILE=1_test_deposit_register_proof.json

if [ ! -d "$BUILD_DIR" ]; then
    echo "No build directory found. Creating build directory..."
    mkdir -p "$BUILD_DIR"
fi

# echo "****COMPILING CIRCUIT****"
# start=`date +%s`
# circom "$CIRCUIT_NAME".circom --r1cs --wasm --sym --c --wat --output "$BUILD_DIR"
# end=`date +%s`
# echo "DONE ($((end-start))s)"

echo "****GENERATING WITNESS FOR SAMPLE INPUT****"
start=`date +%s`
node "$BUILD_DIR"/"$CIRCUIT_NAME"_js/generate_witness.js "$BUILD_DIR"/"$CIRCUIT_NAME"_js/"$CIRCUIT_NAME".wasm "$INPUT_DIR"/$INPUT_FILE "$BUILD_DIR"/witness.wtns
end=`date +%s`
echo "DONE ($((end-start))s)"

# # echo "****GENERATING PTAU FILE****"
# # # Powers of Tau 
# # snarkjs powersoftau new bn128 16 "$BUILD_DIR"/pot16_0000.ptau -v
# # snarkjs powersoftau contribute "$BUILD_DIR"/pot16_0000.ptau "$BUILD_DIR"/pot16_0001.ptau --name="First contribution" -v
# # # Phase 2
# # snarkjs powersoftau prepare phase2 "$BUILD_DIR"/pot16_0001.ptau "$BUILD_DIR"/pot16_final.ptau -v

# echo "****GENERATING ZKEY 0****"
# start=`date +%s`
# snarkjs groth16 setup "$BUILD_DIR"/"$CIRCUIT_NAME".r1cs "$BUILD_DIR"/pot16_final.ptau "$BUILD_DIR"/"$CIRCUIT_NAME"_0.zkey
# end=`date +%s`
# echo "DONE ($((end-start))s)"

# echo "****CONTRIBUTE TO THE PHASE 2 CEREMONY****"
# start=`date +%s`
# snarkjs zkey contribute "$BUILD_DIR"/"$CIRCUIT_NAME"_0.zkey "$BUILD_DIR"/"$CIRCUIT_NAME"_1.zkey --name="1st Contributor Name" -v
# end=`date +%s`
# echo "DONE ($((end-start))s)"

# echo "** Exporting vkey"
# start=`date +%s`
# snarkjs zkey export verificationkey "$BUILD_DIR"/"$CIRCUIT_NAME"_1.zkey "$BUILD_DIR"/verification_key.json
# end=`date +%s`
# echo "DONE ($((end-start))s)"

echo "****GENERATING PROOF FOR SAMPLE INPUT****"
start=`date +%s`
snarkjs groth16 prove "$BUILD_DIR"/"$CIRCUIT_NAME"_1.zkey "$BUILD_DIR"/witness.wtns "$BUILD_DIR"/proof.json "$BUILD_DIR"/public.json
end=`date +%s`
echo "DONE ($((end-start))s)"

# echo "****VERIFYING PROOF FOR SAMPLE INPUT****"
# start=`date +%s`
# snarkjs groth16 verify "$BUILD_DIR"/verification_key.json "$BUILD_DIR"/public.json "$BUILD_DIR"/proof.json
# end=`date +%s`
# echo "DONE ($((end-start))s)"

# # generate smart contract
# mkdir -p "$BUILD_DIR"/smart_contract
# start=`date +%s`
# snarkjs zkey export solidityverifier "$BUILD_DIR"/"$CIRCUIT_NAME"_1.zkey "$BUILD_DIR"/smart_contract/verifier.sol
# end=`date +%s`
# echo "DONE ($((end-start))s)"

# start=`date +%s`
# snarkjs zkey export soliditycalldata "$BUILD_DIR"/public.json "$BUILD_DIR"/proof.json
# end=`date +%s`
# echo "DONE ($((end-start))s)"

snarkjs zkey export soliditycalldata "$BUILD_DIR"/public.json "$BUILD_DIR"/proof.json