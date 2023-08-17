import {Zk_proof} from "./modules/zk_proof.js";

//use 4 node to build tree
// hash0: '0x3cac317908c699fe873a7f6ee4e8cd63fbe9918b2315c97be91585590168e301',
// hash1: '0xd6a4144868703d1474cd7c5b4b1697b412eece270b7a4428b750c7458f73d163',
// hash2: '0x70620458a6db5a8631a8cdc160462b1c0c2535bc813757ffc9374638c3999b0a',
// hash3: '0xba78901e710fee2f40d93e4a43888f008ce586f8ac2f6c493110334e925bab3d',

const node = "0x3cac317908c699fe873a7f6ee4e8cd63fbe9918b2315c97be91585590168e301"; // hash0
const DR_Proofs = ["0xd6a4144868703d1474cd7c5b4b1697b412eece270b7a4428b750c7458f73d163",
 "0x1523c6dd799ff293588ba98330d4dae7533b7b8981e37fb687ed901c1bf0530a"]; //hash1, hash(hash2, hash3)
const DR_Path = [0, 0];
const DR_intermediate_acc_root = "0x4a7eeb20605ab42648f4f9b350e7aef221b2e2a3436d9e01192c872318269e3b"; //hash(0,1,2,3)

let zk_proof = new Zk_proof(node, DR_Proofs, DR_Path, DR_intermediate_acc_root);
console.log(zk_proof.proof);