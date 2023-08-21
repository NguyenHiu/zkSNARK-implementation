

circom deposit_register_verifier.circom --r1cs --wasm --sym --c --wat --output ../../build/circuits/deposit_register_verifier/
node ../../build/circuits/deposit_register_verifier/deposit_register_verifier_js/generate_witness.js ../../build/circuits/deposit_register_verifier//deposit_register_verifier_js/deposit_register_verifier.wasm ../../build/inputs/1_test_deposit_register_proof.json ../../build/circuits/deposit_register_verifier/witness.wtns
