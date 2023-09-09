# Zk-rollup in Ethereum

Smart contracts and Circuits have already been compiled.

[Only Feature: Deposit Register]
How to use:
- Run `npm start`.
- Open the login page and log in using the address and private key from the `build/ganache_accounts/accounts.json` file (the first address is designated as the Coordinator).
- Initiate some deposit register transactions (>=4 & <8) using the public key (from `build/ganache_accounts/publickey.json`). This demo version defines a fixed tree with 8 leaf nodes and 4 leaf nodes for the deposit register tree.
- Click on 'Process Deposit Register' to update the new state on the blockchain.
- Wait for a successful notification and check the new account tree (click the 'Wanna see account tree?' button).
<!-- ## 1. How to use
Open ganache

### 1.1. Migrate & Compile
Make sure truffle project connects to the right port (ganache server), and then run this command inside the folder of truffle project.
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
**Update**: No need to copy the value of abi.json if you are not change the contract.

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
### Zkp
- Compile circom
``` bash
circom verify_merkle_root.circom --r1cs --wasm --sym
``` -->