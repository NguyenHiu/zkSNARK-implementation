const Web3 = require("web3");
const abi = require("./_abi.json");
const smart_contract_address = require("./_smart_contract_address.json");

var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:8545"));

if (web3.eth.net.isListening()) {
    console.log("true");
}
else {
    console.log("false");
}

var middleware = new web3.eth.Contract(abi, smart_contract_address);

var address_1 = '0xe71047BcD46eA816576FC454E3e8fc925960595B';
var address_2 = '0x8972b8cD57812c7Ef37B85E2f1fF126b6910141a';
var address_3 = '0x69a83EFfc307a32b1cfc9626B80d686fBb151d66';
var address_4 = '0xA5F352C55Ab104cE9a0Bf2Ecb3F723e6ce8922c8';

middleware.methods._deposit(address_1, 20).send(
    {
        from: address_1,
        value: 200000000000000000,
        gas: 200000
    }
    , function (err, res) {
        console.log("err: " + err);
        console.log("res: " + res);

        middleware.methods._deposit(address_2, 20).send(
            {
                from: address_2,
                value: 200000000000000000,
                gas: 200000
            }
            , function (err, res) {
                console.log("err: " + err);
                console.log("res: " + res);
                middleware.methods._deposit(address_3, 20).send(
                    {
                        from: address_3,
                        value: 200000000000000000,
                        gas: 200000
                    }
                    , function (err, res) {
                        console.log("err: " + err);
                        console.log("res: " + res);
                        middleware.methods._deposit(address_4, 20).send(
                            {
                                from: address_4,
                                value: 200000000000000000,
                                gas: 200000
                            }
                            , function (err, res) {
                                console.log("err: " + err);
                                console.log("res: " + res);
                                middleware.methods._process_deposit_register().send(
                                    {
                                        from: address_2
                                    }, function (err, res) {
                                        console.log("err: " + err);
                                        console.log("res: " + res);

                                        middleware.methods._deposit(address_1, 20).send(
                                            {
                                                from: address_1,
                                                value: 200000000000000000,
                                                gas: 200000

                                            }
                                            , function (err, res) {
                                                console.log("err: " + err);
                                                console.log("res: " + res);
                                                middleware.methods._deposit(address_2, 20).send(
                                                    {
                                                        from: address_2,
                                                        value: 200000000000000000,
                                                        gas: 200000
                                                    }
                                                    , function (err, res) {
                                                        console.log("err: " + err);
                                                        console.log("res: " + res);
                                                        middleware.methods._deposit(address_3, 20).send(
                                                            {
                                                                from: address_3,
                                                                value: 200000000000000000,
                                                                gas: 200000
                                                            }
                                                            , function (err, res) {
                                                                console.log("err: " + err);
                                                                console.log("res: " + res);
                                                                middleware.methods._deposit(address_4, 20).send(
                                                                    {
                                                                        from: address_4,
                                                                        value: 200000000000000000,
                                                                        gas: 200000
                                                                    }
                                                                    , function (err, res) {
                                                                        console.log("err: " + err);
                                                                        console.log("res: " + res);
                                                                        middleware.methods._process_deposit_existence().send(
                                                                            {
                                                                                from: address_2
                                                                            }, function (err, res) {
                                                                                console.log("err: " + err);
                                                                                console.log("res: " + res);
                                                                            });
                                                                    })
                                                            })
                                                    })
                                            })
                                    });
                            })
                    })
            })
    })