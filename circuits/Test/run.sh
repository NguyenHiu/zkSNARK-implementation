#!/bin/bash

BUILD_DIR=../../build/circuits/test
CIRCUIT_NAME=test
INPUT_DIR=../../build/inputs
INPUT_FILE=test.json

if [ ! -d "$BUILD_DIR" ]; then
    echo "No build directory found. Creating build directory..."
    mkdir -p "$BUILD_DIR"
fi

echo "****COMPILING CIRCUIT****"
circom "$CIRCUIT_NAME".circom --r1cs --wasm --sym --c --wat --output "$BUILD_DIR"

echo "****GENERATING WITNESS FOR SAMPLE INPUT****"
node "$BUILD_DIR"/"$CIRCUIT_NAME"_js/generate_witness.js "$BUILD_DIR"/"$CIRCUIT_NAME"_js/"$CIRCUIT_NAME".wasm "$INPUT_DIR"/$INPUT_FILE "$BUILD_DIR"/witness.wtns
