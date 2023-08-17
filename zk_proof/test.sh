#!/bin/bash

cd verify_merkle_root_js || exit

node generate_witness.js verify_merkle_root.wasm input.json witness.wtns

cd ..

ls