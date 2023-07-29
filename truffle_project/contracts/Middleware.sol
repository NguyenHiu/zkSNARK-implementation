pragma solidity >=0.7.0 <0.9.0;

contract Middleware {
    /* DATA STRUCURE SECTION */
    bytes32[10] hash0 = [
        bytes32(
            0x3cac317908c699fe873a7f6ee4e8cd63fbe9918b2315c97be91585590168e301
        ),
        bytes32(
            0xd6a4144868703d1474cd7c5b4b1697b412eece270b7a4428b750c7458f73d163
        ),
        bytes32(
            0x70620458a6db5a8631a8cdc160462b1c0c2535bc813757ffc9374638c3999b0a
        ),
        bytes32(
            0xba78901e710fee2f40d93e4a43888f008ce586f8ac2f6c493110334e925bab3d
        ),
        bytes32(
            0xb3071dfe86f33fe4b792b764c02bf1846e60309294bbc955eecec20de535e79b
        ),
        bytes32(
            0xd5f4d4f3a12a96670788488191268eba24edef266e8daf351cc58de6ba070cc8
        ),
        bytes32(
            0x4383b8a05505a19df40ad49486feca659270f2e61b8cea10def78ca226f4fa6b
        ),
        bytes32(
            0x2235dd0e52d5fd51624a4297f90019372475057a149fcf333478b639c6c6a701
        ),
        bytes32(
            0x3f196d31b8b97caa45a187e1ecfb14eb76468fb95cee57b1862213861a593377
        ),
        bytes32(
            0x9d952dab4bf3d73556437c642f74335230419daf1d9f88bb6096e1a8a027bf41
        )
    ];
    mapping(address => bool) exists;
    bytes32[] deposit_register_root;
    uint deposit_register_count = 0;
    bytes32[] deposit_existence_root;
    uint deposit_existence_count = 0;
    uint height_acc_tree = 3;
    bytes32 account_root = hash0[height_acc_tree];

    // EVENTS
    event _e_deposit_register(address _from, address _to, uint _amount);
    event _e_deposit_existence(address _from, address _to, uint _amount);
    event _e_process_deposit_register(bytes32 root);
    event _e_process_deposit_existence(bytes32 root);
    event _e_transfer(address _from, address _to, uint _amount);
    event _e_withdraw();
    event _e_valid_proof_register();
    event _e_invalid_proof_register();
    event _e_valid_proof_existence();
    event _e_invalid_proof_existence();
    event _e_get_deposit_register_root(bytes32 value);
    event _e_get_deposit_existence_root(bytes32 value);

    /* END-DATA STRUCURE SECTION */

    function _process_deposit_register() public {
        emit _e_process_deposit_register(deposit_register_root[0]);
    }

    function _process_deposit_existence() public {
        emit _e_process_deposit_existence(deposit_existence_root[0]);
    }

    function _get_deposit_register_root() public {
        if (deposit_register_count != 0)
            emit _e_get_deposit_register_root(deposit_register_root[0]);
        else emit _e_get_deposit_register_root(hash0[0]);
    }

    function _get_deposit_existence_root() public {
        if (deposit_existence_count != 0)
            emit _e_get_deposit_existence_root(deposit_existence_root[0]);
        else emit _e_get_deposit_existence_root(hash0[0]);
    }

    function __log2(uint i) private pure returns (uint) {
        uint res = 0;
        while (i > 1) {
            i /= 2;
            res += 1;
        }
        return res;
    }

    function __is_valid_merkle_proof(
        bytes32 node,
        bytes32[] memory proofs,
        int32[] memory path,
        bytes32 root
    ) private pure returns (bool) {
        bytes32 _root = node;
        for (uint8 i = 0; i < path.length; ++i) {
            if (path[i] == 0)
                _root = keccak256(abi.encodePacked(_root, proofs[i]));
            else _root = keccak256(abi.encodePacked(proofs[i], _root));
        }
        return (_root == root);
    }

    function _verify_process_deposit_register(
        bytes32[] memory DR_Proofs,
        int32[] memory DR_Path,
        bytes32 DR_intermediate_acc_root
    ) public {
        if (
            __is_valid_merkle_proof(
                hash0[__log2(deposit_register_count)],
                DR_Proofs,
                DR_Path,
                account_root
            ) &&
            __is_valid_merkle_proof(
                deposit_register_root[0],
                DR_Proofs,
                DR_Path,
                DR_intermediate_acc_root
            )
        ) {
            account_root = DR_intermediate_acc_root;
            deposit_register_count -= 4;
            for (uint i = 1; i < deposit_register_root.length; ++i)
                deposit_register_root[i - 1] = deposit_register_root[i];
            deposit_register_root.pop();
            emit _e_valid_proof_register();
        } else emit _e_invalid_proof_register();
    }

    // DR: Deposit Register
    // DE: Deposit Existence
    function _verify_process_deposit_existence(
        address[] memory from,
        address[] memory to,
        uint[] memory current_balance,
        uint[] memory deposit_amount,
        bytes32[][] memory DE_Proofs_TX,
        int32[][] memory DE_Path_TX,
        bytes32[][] memory DE_Proofs,
        int32[][] memory DE_Path,
        bytes32[] memory DE_intermediate_acc_root
    ) public {
        bytes32 intermediate_acc_root = account_root;
        for (uint i = 0; i < DE_Proofs_TX.length; ++i) {
            if (
                (((DE_Proofs_TX[i].length == 0) &&
                    (deposit_existence_root[0] ==
                        keccak256(
                            abi.encodePacked(from[i], to[i], deposit_amount[i])
                        ))) ||
                    ((DE_Proofs_TX[i].length != 0) &&
                        __is_valid_merkle_proof(
                            keccak256(
                                abi.encodePacked(
                                    from[i],
                                    to[i],
                                    deposit_amount[i]
                                )
                            ),
                            DE_Proofs_TX[i],
                            DE_Path_TX[i],
                            deposit_existence_root[0]
                        ))) &&
                __is_valid_merkle_proof(
                    keccak256(
                        abi.encodePacked(from[i], to[i], current_balance[i])
                    ),
                    DE_Proofs[i],
                    DE_Path[i],
                    intermediate_acc_root
                ) &&
                __is_valid_merkle_proof(
                    keccak256(
                        abi.encodePacked(
                            from[i],
                            to[i],
                            uint(deposit_amount[i] + current_balance[i])
                        )
                    ),
                    DE_Proofs[i],
                    DE_Path[i],
                    DE_intermediate_acc_root[i]
                )
            ) {
                intermediate_acc_root = DE_intermediate_acc_root[i];
            } else {
                emit _e_invalid_proof_existence();
                return;
            }
        }
        deposit_existence_count -= 4;
        for (uint i = 1; i < deposit_existence_root.length; ++i)
            deposit_existence_root[i - 1] = deposit_existence_root[i];
        deposit_existence_root.pop();
        emit _e_valid_proof_existence();
    }

    function _deposit(address layer2_address, uint amount) public payable {
        if (exists[layer2_address]) {
            _deposit_existence(msg.sender, layer2_address, amount);
        } else {
            exists[layer2_address] = true;
            _deposit_register(msg.sender, layer2_address, amount);
        }
    }

    function _deposit_register(
        address l1_addr,
        address l2_addr,
        uint amount
    ) private {
        emit _e_deposit_register(l1_addr, l2_addr, amount);
        ++deposit_register_count;

        uint cnt = deposit_register_count;
        bytes32 tmp = keccak256(abi.encodePacked(l1_addr, l2_addr, amount));
        bytes32 tmp2;

        while (cnt % 2 == 0) {
            cnt /= 2;
            tmp2 = deposit_register_root[deposit_register_root.length - 1];
            deposit_register_root.pop();
            tmp = keccak256(abi.encodePacked(tmp2, tmp));
        }
        deposit_register_root.push(tmp);
    }

    function _deposit_existence(
        address l1_addr,
        address l2_addr,
        uint amount
    ) private {
        emit _e_deposit_existence(l1_addr, l2_addr, amount);
        ++deposit_existence_count;

        uint cnt = deposit_existence_count;
        bytes32 tmp = keccak256(abi.encodePacked(l1_addr, l2_addr, amount));
        bytes32 tmp2;

        while (cnt % 2 == 0) {
            cnt /= 2;
            tmp2 = deposit_existence_root[deposit_existence_root.length - 1];
            deposit_existence_root.pop();
            tmp = keccak256(abi.encodePacked(tmp2, tmp));
        }
        deposit_existence_root.push(tmp);
    }

    function _transfer() public {
        // emit _e_transfer();
    }

    function _withdraw() public {
        emit _e_withdraw();
    }
}