#!/bin/bash

cd verify_merkle_root_js || exit

node generate_witness.js verify_merkle_root.wasm input.json witness.wtns

cd ..

snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
snarkjs groth16 setup multiplier2.r1cs pot12_final.ptau multiplier2_0000.zkey
snarkjs zkey contribute multiplier2_0000.zkey multiplier2_0001.zkey --name="1st Contributor Name" -v
snarkjs zkey export verificationkey multiplier2_0001.zkey verification_key.json

snarkjs groth16 prove multiplier2_0001.zkey witness.wtns proof.json public.json