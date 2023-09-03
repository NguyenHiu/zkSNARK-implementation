const secp256k1 = require("secp256k1");
const { uint8Array2Hex } = require("./utils.js");


function hex2Uint8Array(hex, l = 32) {
    const arr = [];
    if ((hex.length > 2) && (hex.slice(0, 2) == "0x")) {
        hex = hex.slice(2);
    }
    if (hex.length == 63) hex = "0" + hex;
    hex.match(/.{1,2}/g).map(x => arr.push(parseInt(x, 16)));
    while (arr.length < l)
        arr.push(0);
    return new Uint8Array(arr);
}



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
            mimc.F.e(uint8Array2Hex(this.fromX)),
            mimc.F.e(uint8Array2Hex(this.fromY)),
            mimc.F.e(uint8Array2Hex(this.toX)),
            mimc.F.e(uint8Array2Hex(this.toY)),
            mimc.F.e(uint8Array2Hex(this.nonce)),
            mimc.F.e(uint8Array2Hex(this.amount)),
            // this.fromX,
            // this.fromY,
            // this.toX,
            // this.toY,
            // this.nonce,
            // this.amount,
        ]);
        return txHash;
    }

    signTxHash(prvkey, mimc) {
        const _s = secp256k1.ecdsaSign(hex2Uint8Array(mimc.F.toString(this.hash, 16)), prvkey);
        this.r = _s.signature.slice(0, 32);
        this.s = _s.signature.slice(32);
        this.v = _s.recid;
    }

    checkSignature(mimc) {
        // signature
        const signature = new Uint8Array(this.r.length + this.s.length);
        signature.set(this.r);
        signature.set(this.s, this.r.length);

        // console.log("fromX: ", this.fromX);
        // console.log("fromY: ", this.fromY);
        // pubkey
        const pubkey = new Uint8Array(this.fromX.length + this.fromY.length + 1);
        pubkey.set(new Uint8Array([4]))
        pubkey.set(this.fromX, 1);
        pubkey.set(this.fromY, this.fromX.length + 1);
        // console.log("pubkey: ", pubkey);

        // console.log("signature: ", signature);
        // console.log("pubkey: ", pubkey);

        return secp256k1.ecdsaVerify(signature, hex2Uint8Array(mimc.F.toString(this.hash, 16)), pubkey);
    }
}