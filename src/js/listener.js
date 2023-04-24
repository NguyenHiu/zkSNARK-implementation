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

middleware.events._e_deposit_register(function(err, res) {
    if (!err) {
        console.log(res);
    }
    else {
        console.log(err);
    }
});

middleware.events._e_deposit_existence(function(err, res) {
    if (!err) {
        console.log(res);
    }
    else {
        console.log(err);
    }
});
// middleware.methods._demo().call({from: '0x9B247e1cfF19e6214cEF3620086C866863211835'}, function(error, result){
//     console.log(error);
//     console.log(result);
// });

// middleware.methods._deposit('0xc7870c47DeE5BBEcf31E80f00F02C83466bA099c', 20).send(
//     {
//         from: '0xc7870c47DeE5BBEcf31E80f00F02C83466bA099c',
//         value: 2000000000000000000
        
//     }
//     , function(err, res) {
//         console.log("err: " + err);
//         console.log("res: " + res);
//     }
//     )
//     // .then(require => {
//     //     console.log(require);
//     // })
//     ;

// var _ret = middleware.methods._demo().call();
// console.log(_ret);
// console.log(middleware.methods._demo().call({from: "0x9B247e1cfF19e6214cEF3620086C866863211835"}));