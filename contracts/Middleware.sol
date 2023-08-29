pragma solidity ^0.8.0;

interface MiMC {
    function MiMCpe7(uint256, uint256) external pure returns (uint256);
}

contract Middleware {
    // constants
    uint prime =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;
    uint[10] zeroCache = [
        94722680099764756159715344114821272032571426768046774804987035158066048135449,
        8424832841562211226544002910946085349648918813225913513442684203240096077078,
        44197704158317907713192630833793885820470319960428659112617039771932448693504,
        15930477789293542321832788520371595718736154179618338318569942051590503903493,
        24456052748532017163542039193045207500912698699374716792226646706106269129995,
        15710966271306649051349373776887832255201990728308403695502827246325884977190,
        46061825755796793325488921878807366107061633217621406189820463087175544013836,
        110405580006559763743081492937565134120730116456298553411541600514280272146715,
        47214162484447726990215848897549943863707582778233274500640334702748702329092,
        91600247919164313938162093148836160205870475304194670412711077245187285470998
    ];

    // variables
    mapping(address => bool) existedPubkeys;
    bytes32[] depositRegisterRoots;
    uint noDepositRegisterTx;
    MiMC public mimc;

    // Debug events
    event dDebug(bool state);
    event dGetBytes32(bytes32 value);
    event dGetString(string str);
    event dGetAddress(address addr);
    event dGetBytes20(bytes20 addr);
    event dGetUint(uint u);
    event dGetBytes32Array(bytes32[] arr);

    // main events
    event eDepositRegister(
        bytes32 toX,
        bytes32 toY,
        uint amount,
        bytes32 r,
        bytes32 s
    );

    constructor(address _mimcContractAddress) {
        mimc = MiMC(_mimcContractAddress);
        noDepositRegisterTx = 0;
    }

    function deposit(
        bytes32 fromX,
        bytes32 fromY,
        bytes32 toX,
        bytes32 toY,
        uint amount,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public payable {
        // emit dDebug(true);
        require(amount * 1e18 == msg.value, "amount*1e18 != msg.value");
        // address receiverAddress = address(
        //     bytes20((keccak256(abi.encodePacked(toX, toY))) << 96)
        // );
        _depositRegister(fromX, fromY, toX, toY, amount, r, s, v);

        // if (existedPubkeys[receiverAddress]) {
        //     emit dDebug(false);
        // } else {
        //     existedPubkeys[receiverAddress] = true;
        //     _depositRegister(toX, toY, amount, r, s);
        // }
    }

    function _depositRegister(
        bytes32 fromX,
        bytes32 fromY,
        bytes32 toX,
        bytes32 toY,
        uint amount,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public {
        
        // Verify transaction signature (r, s) before processing
        // hash, pubX, pubY, r, s --> use verifier.sol (by circuit)

        // 
        // emit eDepositRegister(toX, toY, amount, r, s);

        uint[] memory txProperties = new uint[](6);
        txProperties[0] = uint(fromX);
        txProperties[1] = uint(fromY);
        txProperties[2] = uint(toX);
        txProperties[3] = uint(toY);
        txProperties[4] = 0;
        txProperties[5] = amount;
        uint tmp = uint(mimcMultiHash(txProperties));

        // bytes32[] memory dInput = new bytes32[](4);
        // dInput[0] = bytes32(tmp);
        // dInput[1] = r;
        // dInput[2] = s;
        // dInput[3] = bytes32(uint(v));
        // emit dGetBytes32Array(dInput);
        emit dGetAddress(ecrecover(bytes32(tmp), v+27, r, s));
        // emit dGetAddress(ecrecover(bytes32(tmp), 28, r, s));

        // emit dGetUint(tmp);
        // emit dGetBytes32(bytes32(tmp));

        // noDepositRegisterTx += 1;
        // uint _noTx = noDepositRegisterTx;
        // while (_noTx % 2 == 0) {
        //     _noTx /= 2;
        //     uint[] memory inputArray = new uint[](2);
        //     inputArray[0] = tmp;
        //     inputArray[1] = uint(
        //         depositRegisterRoots[depositRegisterRoots.length - 1]
        //     );
        //     depositRegisterRoots.pop();
        //     tmp = mimcMultiHash(inputArray);
        // }
        // depositRegisterRoots.push(bytes32(tmp));
    }

    function getDepositRegisterRoot() public {
        emit dGetBytes32(depositRegisterRoots[0]);
    }

    function test(bytes32 x, uint X) public {
        if (uint(x) - X == 0)
            emit dDebug(true);
        else 
            emit dDebug(false);
    }

    function testVerify(bytes32 r, bytes32 s, uint8 v, bytes32 hashv) public {
        emit dGetAddress(ecrecover(hashv, v, r, s));
    }

    function mimcMultiHash(uint[] memory arr) public view returns (uint) {
        uint r = 0;
        for (uint i = 0; i < arr.length; i++) {
            // emit dGetBytes32(bytes32(r));
            r = (((r + mimc.MiMCpe7(arr[i], r)) % prime) + arr[i]) % prime;
        }
        return r;
    }
}
