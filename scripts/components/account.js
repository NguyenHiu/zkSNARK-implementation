module.exports = class Account {
    constructor(
        _index,
        _pubkeyX, _pubkeyY,
        _balance, _nonce,
        mimc
    ) {
        this.index = _index;
        this.pubkeyX = _pubkeyX;
        this.pubkeyY = _pubkeyY;
        this.balance = _balance;
        this.nonce = _nonce;
        this.hash = this.hashAccount(mimc);
    }

    hashAccount(mimc) {
        const accountHash = mimc.multiHash([
            mimc.F.toString(this.pubkeyX),
            mimc.F.toString(this.pubkeyY),
            mimc.F.toString(this.balance),
            mimc.F.toString(this.nonce)
        ]);
        return accountHash;
    }

    acceptSendTx(_amount, mimc) {
        this.balance -= _amount;
        this.nonce += 1;
        this.hash = this.hashAccount(mimc);
    }

    acceptReceiveTx(_amount, mimc) {
        this.balance = mimc.F.e(BigInt(mimc.F.toString(this.balance)) + BigInt(mimc.F.toString(_amount)));
        this.hash = this.hashAccount(mimc);
    }
}