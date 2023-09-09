/* 
    Create Account Zero 
*/

const ethers = require("ethers");
const buildMimc7 = require("circomlibjs").buildMimc7;
const Account = require("../account.js");
const {uint8Array2Hex, hex2Uint8Array} = require("../utils.js");


async function app() {
    const mimc = await buildMimc7();

    const zeroUint8Array = new Uint8Array(new Array(32).fill(0));
    const zeroPrivateKey_uint8array = mimc.multiHash([zeroUint8Array, zeroUint8Array]);

    const zeroPrivateKey_hex = uint8Array2Hex(zeroPrivateKey_uint8array);
    
    const wallet = new ethers.Wallet(zeroPrivateKey_hex);
    const zeroPublicKey_hex = wallet.publicKey;
    const zeroPublicKeyX_hex = "0x" + zeroPublicKey_hex.slice(4, 68);
    const zeroPublicKeyY_hex = "0x" + zeroPublicKey_hex.slice(68);

    const zeroPublicKeyX_uint8array = hex2Uint8Array(zeroPublicKeyX_hex);
    const zeroPublicKeyY_uint8array = hex2Uint8Array(zeroPublicKeyY_hex);

    const zeroAccount = new Account(0, zeroPublicKeyX_uint8array, zeroPublicKeyY_uint8array, 0, 0, mimc);
    let tmp = zeroAccount.hash;
    const Empty = [tmp];
    for (let i = 0; i < 9; ++i) {
       tmp = mimc.multiHash([tmp, tmp]);
       Empty.push(tmp); 
    }

    console.log(`exports.ZeroPrvKey = new Uint8Array([${zeroPrivateKey_uint8array}])`);
    console.log(`exports.ZeroPubKeyX = new Uint8Array([${zeroPublicKeyX_uint8array}])`);
    console.log(`exports.ZeroPubKeyY = new Uint8Array([${zeroPublicKeyY_uint8array}])`);
    console.log(`exports.Empty = [`)
    for(let i = 0; i < Empty.length; ++i) {
        if (i != Empty.length-1)
            console.log(`new Uint8Array([${Empty[i]}]),`);
        else
            console.log(`new Uint8Array([${Empty[i]}])`);

    }
    console.log(`]`)

    console.log();

    for (let i = 0; i < 10; ++i) {
        console.log(mimc.F.toString(Empty[i]));
    }

}

app();