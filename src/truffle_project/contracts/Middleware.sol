pragma solidity >=0.7.0 <0.9.0;

contract Middleware {
    mapping(address => bool) exists;

    event _e_deposit_register(address _from, address _to, uint amount);
    event _e_deposit_existence(address _from, address _to, uint amount);
    event _e_transfer(address _from, address _to, uint amount);
    event _e_withdraw();

    function _demo() pure public returns(uint) {
        return 1;
    }

    function _deposit(address layer2_address, uint amount) payable public  returns(uint){
        // payable(msg.sender).transfer(amount);

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
        return 0;
    }

    function _deposit_existence(address l1_addr, address l2_addr, uint amount) private returns(uint) {
        emit _e_deposit_existence(l1_addr, l2_addr, amount);
        return 1;
    }

    function _transfer() public {
        // emit _e_transfer();
    }

    function _withdraw() public {
        emit _e_withdraw();
    }
}