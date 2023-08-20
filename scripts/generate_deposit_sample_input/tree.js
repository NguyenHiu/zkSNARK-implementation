const Node = require("./node.js");
const circomlibjs = require("circomlibjs")
// const bigInt = require("snarkjs").bigInt;

module.exports =
    class Tree {
        constructor(_leafNodes, mimc) {
            this.leafNodes = _leafNodes;
            this.depth = Math.log(_leafNodes.length) / Math.log(2);
            this.innerNodes = this.createTree(mimc);
            this.root = this.innerNodes[0][0];
        }

        createTree(mimc) {
            if (this.leafNodes.length % 2 != 0)
                console.log("this._leafNodes.length % 2 != 0");
            else {
                let tree = Array(this.depth);
                tree[this.depth - 1] = this._h_hashArray(this.leafNodes, mimc);

                for (let i = this.depth - 2; i >= 0; --i) {
                    tree[i] = this._h_hashArray(tree[i + 1], mimc);
                }
                return tree;
            }
        }

        getProof(_index) {
            const proof = [];
            const proofPos = [];
            let idx = _index;
            if (idx % 2 != 0) {
                proof.push(this.leafNodes[idx - 1]);
                proofPos.push(0);
            }
            else {
                proof.push(this.leafNodes[idx + 1]);
                proofPos.push(1);
            }
            idx = Math.floor(idx / 2);

            for (let i = this.innerNodes.length - 1; i >= 1; --i) {
                if (idx % 2 != 0) {
                    proof.push(this.innerNodes[i][idx - 1]);
                    proofPos.push(0);
                }
                else {
                    proof.push(this.innerNodes[i][idx + 1]);
                    proofPos.push(1);
                }
                idx = Math.floor(idx / 2);
            }
            return { proof: proof, proofPos: proofPos };
        }

        rehashingTree(_index, _proof, _path, mimc) {
            let idx = Math.floor(_index / 2);
            let newValue = this.leafNodes[_index];
            for (let i = this.innerNodes.length - 1; i >= 0; --i) {
                if (_path[this.innerNodes.length - 1 - i] == 0) {
                    this.innerNodes[i][idx] = mimc.multiHash([
                        _proof[this.innerNodes.length - 1 - i],
                        newValue
                    ]);
                }
                else {
                    this.innerNodes[i][idx] = mimc.multiHash([
                        newValue,
                        _proof[this.innerNodes.length - 1 - i]
                    ]);
                }
                newValue = this.innerNodes[i][idx];
                idx = Math.floor(idx / 2);
            }
        }

        /* helper */
        // create hash array of uint8array type
        _h_hashArray(array, mimc) {
            if (array.length % 2 != 0) {
                console.log("array.length % 2 != 0");
            }
            else {
                let res = []
                for (let i = 0; i < array.length; i += 2) {
                    res.push(mimc.multiHash([
                        array[i],
                        array[i + 1]
                    ]));
                }
                return res;
            }
        }


        /* Debug */
        _d_print() {
            console.log(this.innerNodes);
            // for (let i = 0; i < this.innerNodes.length; ++i) {
            //     for (let j = 0; j < this.innerNodes[i].length; ++j) {
            //         console.log(this.innerNodes[i][j]);
            //     }
            // }
        }
    }

/* TEST */
// circomlibjs.buildMimc7().then((_mimc) => {
//     const _leafNodes = [1,2,3,4,5,6,7,8];
//     const tree = new Tree(_leafNodes, _mimc);
//     tree._d_print();
// })