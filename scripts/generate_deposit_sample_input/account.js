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
            this.pubkeyX, this.pubkeyY,
            Uint8Array.from(this.balance),
            Uint8Array.from(this.nonce)
        ]);
        return accountHash;
    }

    acceptSendTx(_amount, mimc) {
        if (this.index > 0) {
            this.balance -= _amount;
            this.nonce += 1;
            this.hash = this.hashAccount(mimc);
        }
    }

    acceptReceiveTx(_amount, mimc) {
        // if this.index == 0, then this is zero-account (deposit)
        if (this.index > 0) {
            this.balance += _amount;
            this.hash = this.hashAccount(mimc);
        }
    }
}