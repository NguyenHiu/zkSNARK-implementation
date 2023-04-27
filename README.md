# Zk-rollup in Ethereum
## 1. How to use
Open ganache

### 1.1. Migrate & Compile
Make sure truffle project connects to the right port (ganache server), and then
``` bash
truffle migrate 
```

### 1.2. Use console to interact with contract
``` bash
truffe console
```
Result
``` bash
truffle(development)>
```

#### 1.2.1. Get abi & address of smart contract 
``` bash
truffle(development)> var contract = await <ContactName>.deployed()
truffle(development)> JSON.stringify(contract.abi)
truffle(development)> contract.address
```
Copy Abi & Address of smart contract, and paste into _abi.json & _smart_cotract_address.json, respectively. <br>
**note:** only take the value of the string

### 1.3. Running
#### 1.3.1. Listener
Run listener.js first to listen event from smart contract
``` bash
node lisnter.js
``` 
#### 1.3.2. Actor
Make some events with actor
``` bash
node actor.js
```