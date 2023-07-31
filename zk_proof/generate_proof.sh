#!/bin/bash

cd /home/victus-15/Study/Luan-Van/solidity-back-up/zk_proof/verify_merkle_root_js || exit

node generate_witness.js verify_merkle_root.wasm input.json witness.wtns
# move witness.wtns to zk_proof
mv witness.wtns ../witness.wtns

cd ..

snarkjs groth16 prove verify_merkle_root_0001.zkey witness.wtns proof.json public.json

snarkjs generatecall > out.txt