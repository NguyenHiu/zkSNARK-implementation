const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));

if(web3.eth.net.isListening()) {
    console.log("true");
}
else {
    console.log("false");
}

const abi = require("./abi.json");
const smart_contract_address = require("./smart_contract_address.json");

var middleware = new web3.eth.Contract(abi, smart_contract_address);


middleware.methods._deposit('0x0721350753Def67bEfbc51121e14051A79ea8E2a', 20).send(
    {
        from: '0x0721350753Def67bEfbc51121e14051A79ea8E2a',
        value: 2000000000000000000
        
    }
    , function(err, res) {
        console.log("err: " + err);
        console.log("res: " + res);
    }
    )
    // .then(require => {
    //     console.log(require);
    // })
    ;