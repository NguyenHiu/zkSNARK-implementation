module.exports = class DEPOSIT {
    _from;  // bytes32
    _to;    // bytes32
    _amount;// uint

    constructor(from, to, amount) {
        this._from = from;
        this._to = to;
        this._amount = amount;
    }
}