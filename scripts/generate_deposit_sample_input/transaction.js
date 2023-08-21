// const { ethers } = require("ethers");
// const { concat, toUtf8Bytes } = require("ethers/lib/utils");
const secp256k1 = require("secp256k1");

module.exports = class Transaction {
    constructor(
        _fromX, _fromY, _toX, _toY, _nonce, _amount,
        _r, _s, _v,
        mimc
    ) {
        // transaction infromation
        this.fromX = _fromX;
        this.fromY = _fromY;
        this.toX = _toX;
        this.toY = _toY;
        this.nonce = _nonce;
        this.amount = _amount

        // signature
        this.r = _r;
        this.s = _s;
        this.v = _v;

        // transaction hash
        this.hash = this.hashTx(mimc);
    }

    hashTx(mimc) {
        // hash unsigned transaction
        const txHash = mimc.multiHash([
            this.fromX, this.fromY,
            this.toX, this.toY,
            this.nonce, this.amount
        ]);
        return txHash;
    }

    signTxHash(prvkey) {
        const _s = secp256k1.ecdsaSign(this.hash, prvkey).signature;
        this.r = _s.slice(0, 32);
        this.s = _s.slice(32);
        this.v = -1; // do not touch right now .-.
    }

    checkSignature() {
        // signature
        const signature = new Uint8Array(this.r.length + this.s.length);
        signature.set(this.r);
        signature.set(this.s, this.r.length);

        // pubkey
        const pubkey = new Uint8Array(this.fromX.length + this.fromY.length);
        pubkey.set(this.fromX);
        pubkey.set(this.fromY, this.fromX.length);

        return secp256k1.ecdsaVerify(signature, this.hash, pubkey);
    }
}