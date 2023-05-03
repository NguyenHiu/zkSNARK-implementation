pragma solidity >=0.7.0 <0.9.0;

contract Middleware {
    mapping(address => bool) exists;
    bytes32[] deposit_register_root;
    uint deposit_register_count = 0;
    bytes32[] deposit_existence_root;
    uint deposit_existence_count = 0;
    bytes32 account_root;

    event _e_deposit_register(address _from, address _to, uint amount);
    event _e_deposit_existence(address _from, address _to, uint amount);
    event _e_transfer(address _from, address _to, uint amount);
    event _e_withdraw();
    event _e_deposit_register_root_change(bytes32 new_root, uint n);
    event _e_deposit_existence_root_change(bytes32 new_root, uint n);
    event _e_process_deposit_tx();

    function _demo() pure public returns(uint) {
        return 1;
    }

    function _process_deposit() public {
        emit _e_process_deposit_tx();
    }

    function _deposit(address layer2_address, uint amount) payable public  returns(uint){
        
        if (exists[layer2_address]) {
            return _deposit_existence(msg.sender, layer2_address, amount);
            // return 1;
        }
        else {
            exists[layer2_address] = true;
            return _deposit_register(msg.sender, layer2_address, amount);
            // return 0;
        }
    }


    function _deposit_register(address l1_addr, address l2_addr, uint amount) private returns(uint) {
        emit _e_deposit_register(l1_addr, l2_addr, amount);
        ++deposit_register_count;

        uint cnt = deposit_register_count;
        bytes32 tmp = keccak256(abi.encodePacked(l1_addr, l2_addr, amount));
        bytes32 tmp2;

        while (cnt % 2 == 0) {
            cnt /= 2;
            tmp2 = deposit_register_root[deposit_register_root.length-1];
            deposit_register_root.pop();
            tmp = keccak256(abi.encodePacked(tmp, tmp2));
        }
        deposit_register_root.push(tmp);

        if (cnt != deposit_register_count)
            emit _e_deposit_register_root_change(deposit_register_root[0], deposit_register_count);
        return 0;
    }


    function _deposit_existence(address l1_addr, address l2_addr, uint amount) private returns(uint) {
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

        if (cnt != deposit_existence_count)
            emit _e_deposit_existence_root_change(deposit_existence_root[0], deposit_existence_count);
        return 1;
    }


    function _transfer() public {
        // emit _e_transfer();
    }


    function _withdraw() public {
        emit _e_withdraw();
    }
}