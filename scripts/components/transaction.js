module.exports = class Transaction {
    constructor(
        _fromX, _fromY,
        _toX, _toY,
        _nonce, _amount,
        _r8x, _r8y, _s,
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
        this.R8X = _r8x;
        this.R8Y = _r8y;
        this.S = _s;

        // transaction hash
        this.hash = this.hashTx(mimc);
    }

    hashTx(mimc) {
        const txHash = mimc.multiHash([
            mimc.F.toString(this.fromX),
            mimc.F.toString(this.fromY),
            mimc.F.toString(this.toX),
            mimc.F.toString(this.toY),
            mimc.F.toString(this.nonce),
            mimc.F.toString(this.amount),
        ]);
        return txHash;
    }

    signTxHash(prvkey, mimc, eddsa) {
        const _s = eddsa.signMiMC(prvkey, mimc.F.e(this.hash));
        this.R8X = _s.R8[0];
        this.R8Y = _s.R8[1];
        this.S = _s.S;
    }

    checkSignature(mimc, eddsa) {
        const S = {
            R8: [this.R8X, this.R8Y],
            S: this.S
        };
        return eddsa.verifyMiMC(
            mimc.F.e(this.hash),
            S, [this.fromX, this.fromY]);
    }
}