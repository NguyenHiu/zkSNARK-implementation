import {Zk_proof} from "./modules/zk_proof.js";

let zk_proof = new Zk_proof("node", "DR_Proofs", "DR_Path", "DR_intermediate_acc_root");
console.log(zk_proof.proof);