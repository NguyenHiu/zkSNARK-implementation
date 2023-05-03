const Web3 = require("web3");
const abi = require("./_abi.json");
const smart_contract_address = require("./_smart_contract_address.json");

var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));

if (web3.eth.net.isListening()) {
    console.log("true");
}
else {
    console.log("false");
}

var middleware = new web3.eth.Contract(abi, smart_contract_address);

middleware.methods._deposit('0x75f96Ad2e056eF2eFB537c646663f13e82ACaA02', 20).send(
    {
        from: '0x75f96Ad2e056eF2eFB537c646663f13e82ACaA02',
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
