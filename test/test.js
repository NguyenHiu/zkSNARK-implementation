function _demo() {
    return [[], ([0]).concat([])]
}

function demo() {
    var [a, b] = _demo();
    return [a, b];
}

var [a, b] = demo()
// console.log(a);
// console.log(b);
if (a != []) {
    console.log('a != []');
}
else {
    console.log('a == []');
}