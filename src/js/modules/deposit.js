export default class DEPOSIT {
    _from;  // bytes32
    _to;    // bytes32
    _amount;// uint

    constructor(from, to, amount) {
        this._from = from;
        this._to = to;
        this._amount = amount;
    }

    is(other) {
        return ((this._from == other._from) &&
            (this._to == other._to) &&
            (this._amount == other._amount));
    }
}