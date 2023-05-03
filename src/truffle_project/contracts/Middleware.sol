pragma solidity >=0.7.0 <0.9.0;

contract Middleware {
    mapping(address => bool) exists;
    bytes32[] public deposit_register_root;
    uint deposit_register_count = 0;
    bytes32[] deposit_existence_root;
    uint deposit_existence_count = 0;
    bytes32 account_root;
    uint height_acc_tree = 3;

    bytes32[10] hash0 = [bytes32(0x3cac317908c699fe873a7f6ee4e8cd63fbe9918b2315c97be91585590168e301),
                        bytes32(0xd6a4144868703d1474cd7c5b4b1697b412eece270b7a4428b750c7458f73d163),
                        bytes32(0x70620458a6db5a8631a8cdc160462b1c0c2535bc813757ffc9374638c3999b0a),
                        bytes32(0xba78901e710fee2f40d93e4a43888f008ce586f8ac2f6c493110334e925bab3d),
                        bytes32(0xb3071dfe86f33fe4b792b764c02bf1846e60309294bbc955eecec20de535e79b),
                        bytes32(0xd5f4d4f3a12a96670788488191268eba24edef266e8daf351cc58de6ba070cc8),
                        bytes32(0x4383b8a05505a19df40ad49486feca659270f2e61b8cea10def78ca226f4fa6b),
                        bytes32(0x2235dd0e52d5fd51624a4297f90019372475057a149fcf333478b639c6c6a701),
                        bytes32(0x3f196d31b8b97caa45a187e1ecfb14eb76468fb95cee57b1862213861a593377),
                        bytes32(0x9d952dab4bf3d73556437c642f74335230419daf1d9f88bb6096e1a8a027bf41)]; 

    event _e_deposit_register(address _from, address _to, uint _amount);
    event _e_deposit_existence(address _from, address _to, uint _amount);
    event _e_process_deposit(bytes32 deposit_register_root, bytes32 deposit_existence_root);

    event _e_transfer(address _from, address _to, uint _amount);
    event _e_withdraw();

    event _e_valid_proof();

    event _e_tracking(bytes32 _value);

    bytes32[] __demo;

    function _demo(bytes32 v1, bytes32 v2) public {
        emit _e_tracking(keccak256(abi.encodePacked(v1, v2)));
        __demo.push(v1);
        emit _e_tracking(keccak256(abi.encodePacked(__demo[__demo.length-1],v2)));
    }


    function _process_deposit() public {
        emit _e_process_deposit(deposit_register_root[0], deposit_existence_root[0]);
    }


    function _verify_deposit_register(bytes32[] memory proof, uint height) public {
        bytes32 val = hash0[height];
        uint _height = height;
        for (uint i = 0; i < proof.length; ++i) {
            val = keccak256(abi.encodePacked(val, proof[i]));
            ++_height;
        }

        if ((_height == height_acc_tree) && (val == account_root)) {
            emit _e_valid_proof();
        }
    }


    function _verify_deposit_existence(bytes32[] memory proof, uint height) public {
        
    }


    function _deposit(address layer2_address, uint amount) payable public {
        if (exists[layer2_address]) {
            _deposit_existence(msg.sender, layer2_address, amount);
        }
        else {
            exists[layer2_address] = true;
            _deposit_register(msg.sender, layer2_address, amount);
        }
    }


    function _deposit_register(address l1_addr, address l2_addr, uint amount) private {
        emit _e_deposit_register(l1_addr, l2_addr, amount);
        ++deposit_register_count;

        uint cnt = deposit_register_count;
        bytes32 tmp = keccak256(abi.encodePacked(l1_addr, l2_addr, amount));
        bytes32 tmp2;

        while (cnt % 2 == 0)
        {
            cnt /= 2;
            tmp2 = deposit_register_root[deposit_register_root.length-1];
            deposit_register_root.pop();
            tmp = keccak256(abi.encodePacked(tmp2, tmp));
        }
        deposit_register_root.push(tmp);
    }


    function _deposit_existence(address l1_addr, address l2_addr, uint amount) private {
        emit _e_deposit_existence(l1_addr, l2_addr, amount);
        ++deposit_existence_count;

        uint cnt = deposit_existence_count;
        bytes32 tmp = keccak256(abi.encodePacked(l1_addr, l2_addr, amount));
        bytes32 tmp2;

        while (cnt % 2 == 0) {
            cnt /= 2;
            tmp2 = deposit_existence_root[deposit_existence_root.length-1];
            deposit_existence_root.pop();
            tmp = keccak256(abi.encodePacked(tmp, tmp2));
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