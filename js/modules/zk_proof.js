import fs from 'fs';
import child_process from "child_process";
// import {__dirname} from "./constants";

class Zk_proof {
    constructor(node, path, path_pos, root){
        this._generate_input(node, path, path_pos, root);
    }

    _generate_input(node, path, path_pos, root) {

        // create input file
        var dict = {
            "leaf": node,
            "paths2_root": path,
            "paths2_root_pos": path_pos,
            "root": root
        }
        var dictstring = JSON.stringify(dict);
        console.log(dictstring);
        fs.writeFile("input.json", dictstring, (err) => {
            console.log("Writing file\n");
            if (err){
                console.log("Error writing file\n");
                // console.log(err);
            }
            else {
                console.log("File written successfully\n");
            }
        });

        // run the shell script
        // console.log(__dirname);
        child_process.exec('bash ../zk_proof/generate_proof.sh', (err, stdout, stderr) => {
            if (err) {
                console.error(err)
                process.exit(1)
            } else {
                console.log(`The stdout Buffer from shell: ${stdout.toString()}`)
                console.log(`The stderr Buffer from shell: ${stderr.toString()}`)
            }
        })
    }

    _construct_proof(props) {
        this.pi_a = this._convert2Hex(props.pi_a);
        this.pi_b = this._convert2Hex(props.pi_b);
        this.pi_c = this._convert2Hex(props.pi_c);
    }

    _construct_public() {

    }
    _convert2Hex(arr) {
        let hex = [];
        for (let i = 0; i < arr.length; ++i) {
            hex.push((arr[i]).toString(16));
        }
        return hex;
    }

}

export {Zk_proof};