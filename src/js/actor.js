const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));

if (web3.eth.net.isListening()) {
    console.log("true");
}
else {
    console.log("false");
}

const abi = require("./_abi.json");
const smart_contract_address = require("./_smart_contract_address.json");

var middleware = new web3.eth.Contract(abi, smart_contract_address);


middleware.methods._deposit('0x653596177b1E316c3224E4cbcaFb5df9971F58C1', 20).send(
    {
        from: '0xeDB29DDFcB3ed01D69b8f39aA1931F80aaeC5Bd7',
        value: 2000000000000000000,
        gas: 200000

    }
    , function (err, res) {
        console.log("err: " + err);
        console.log("res: " + res);
    }
)
    // .then(require => {
    //     console.log(require);
    // })
    ;
