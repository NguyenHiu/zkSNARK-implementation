pragma solidity ^0.8.0;

import "./DepositRegisterVerifier.sol";

interface IMiMC {
    function MiMCpe7(uint256, uint256) external pure returns (uint256);
}

// interface IDepositRegisterVerifier {
//     function verifyProof(
//         uint[2] calldata,
//         uint[2][2] calldata,
//         uint[2] calldata,
//         uint[4] calldata
//     ) external returns (bool);
// }

contract Middleware is DepositRegisterVerifier {
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
    bytes32[] accountRoots;
    address coordinator;
    IMiMC public mimc;
    // IDepositRegisterVerifier public dpVerifier; // dp - deposit register

    // deposit register variables
    bytes32[] depositAccountRoots;
    bytes32[] depositRegisterTxRoots;
    bytes32[] depositExistenceTxRoots;
    uint noDepositRegisterTx;
    uint noDepositExistenceTx;

    // Debug events
    event dDebug(bool state);
    event dGetBytes32(bytes32 value);
    event dGetString(string str);
    event dGetAddress(address addr);
    event dGetBytes20(bytes20 addr);
    event dGetUint(uint u);
    event dGetBytes32Array(bytes32[] arr);
    event dGetBool(bool b);

    // main events
    event eDepositRegister(
        bytes32 fromX,
        bytes32 fromY,
        bytes32 toX,
        bytes32 toY,
        uint amount,
        bytes32 r8x,
        bytes32 r8y,
        bytes32 s
    );
    event eDepositExistence(
        bytes32 fromX,
        bytes32 fromY,
        bytes32 toX,
        bytes32 toY,
        uint amount,
        bytes32 r8x,
        bytes32 r8y,
        bytes32 s
    );
    event sDepositRegister(bool b);

    constructor(
        address _mimcContractAddress,
        bytes32 initializationAccountRoot
    ) {
        mimc = IMiMC(_mimcContractAddress);
        noDepositRegisterTx = 0;
        noDepositExistenceTx = 0;
        coordinator = msg.sender;
        accountRoots.push(initializationAccountRoot);
    }

    function deposit(
        bytes32 fromX,
        bytes32 fromY,
        bytes32 toX,
        bytes32 toY,
        uint amount,
        bytes32 r8x,
        bytes32 r8y,
        bytes32 s
    ) public payable {
        // emit dDebug(true);
        // require(uint(amount) * 1e18 == msg.value, "amount*1e18 != msg.value");
        address receiverAddress = address(
            bytes20((keccak256(abi.encodePacked(toX, toY))) << 96)
        );

        if (existedPubkeys[receiverAddress]) {
            _depositExistence(fromX, fromY, toX, toY, amount, r8x, r8y, s);
        } else {
            existedPubkeys[receiverAddress] = true;
            _depositRegister(fromX, fromY, toX, toY, amount, r8x, r8y, s);
        }
    }

    function _depositRegister(
        bytes32 fromX,
        bytes32 fromY,
        bytes32 toX,
        bytes32 toY,
        uint amount,
        bytes32 r8x,
        bytes32 r8y,
        bytes32 s
    ) public {
        noDepositRegisterTx += 1;

        // create a new account
        uint[] memory accountProperties = new uint[](4);
        accountProperties[0] = uint(toX);
        accountProperties[1] = uint(toY);
        accountProperties[2] = amount;
        accountProperties[3] = 0;
        uint newAccountHash = uint(mimcMultiHash(accountProperties));

        // create a new tx
        uint[] memory txPropertes = new uint[](6);
        txPropertes[0] = uint(fromX);
        txPropertes[1] = uint(fromY);
        txPropertes[2] = uint(toX);
        txPropertes[3] = uint(toY);
        txPropertes[4] = 0;
        txPropertes[5] = amount;
        uint newTxHash = uint(mimcMultiHash(txPropertes));

        emit eDepositRegister(fromX, fromY, toX, toY, amount, r8x, r8y, s);

        // re-hash root
        uint tmp1 = newAccountHash;
        uint tmp2 = newTxHash;
        uint _noTx = noDepositRegisterTx;
        while (_noTx % 2 == 0) {
            _noTx /= 2;
            uint[] memory inputArray = new uint[](2);
            inputArray[0] = uint(
                depositAccountRoots[depositAccountRoots.length - 1]
            );
            inputArray[1] = tmp1;
            depositAccountRoots.pop();
            tmp1 = mimcMultiHash(inputArray);

            inputArray[0] = uint(depositRegisterTxRoots[depositRegisterTxRoots.length - 1]);
            inputArray[1] = tmp2;
            depositRegisterTxRoots.pop();
            tmp2 = mimcMultiHash(inputArray);
        }
        depositAccountRoots.push(bytes32(tmp1));
        depositRegisterTxRoots.push(bytes32(tmp2));
    }

    function _depositExistence(
        bytes32 fromX,
        bytes32 fromY,
        bytes32 toX,
        bytes32 toY,
        uint amount,
        bytes32 r8x,
        bytes32 r8y,
        bytes32 s
    ) public {
        noDepositExistenceTx += 1;

        // create a new tx
        uint[] memory txPropertes = new uint[](6);
        txPropertes[0] = uint(fromX);
        txPropertes[1] = uint(fromY);
        txPropertes[2] = uint(toX);
        txPropertes[3] = uint(toY);
        txPropertes[4] = 0;
        txPropertes[5] = amount;
        uint newTxHash = uint(mimcMultiHash(txPropertes));

        emit eDepositExistence(fromX, fromY, toX, toY, amount, r8x, r8y, s);

        // re-hash root
        uint tmp = newTxHash;
        uint _noTx = noDepositExistenceTx;
        while (_noTx % 2 == 0) {
            _noTx /= 2;
            uint[] memory inputArray = new uint[](2);
            inputArray[0] = uint(depositExistenceTxRoots[depositExistenceTxRoots.length - 1]);
            inputArray[1] = tmp;
            depositExistenceTxRoots.pop();
            tmp = mimcMultiHash(inputArray);
        }
        depositExistenceTxRoots.push(bytes32(tmp));
    }

    function getDepositRegisterRoot() public {
        emit dGetBytes32(depositAccountRoots[0]);
    }

    function verifyProof_DepositRegister(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[4] calldata _pubSignals
    ) public { 
        require(
            depositRegisterTxRoots[0] == bytes32(_pubSignals[0]),
            "Deposit Transactions are invalid!"
        );
        require(
            depositAccountRoots[0] == bytes32(_pubSignals[1]),
            "New Accounts are invalid"
        );
        require(
            accountRoots[accountRoots.length - 1] == bytes32(_pubSignals[2]),
            "The states do not match"
        );

        require(this.verifyProof(_pA, _pB, _pC, _pubSignals));
        accountRoots.push(bytes32(_pubSignals[3]));
        for (uint8 i = 0; i < depositRegisterTxRoots.length - 1; i++) {
            depositRegisterTxRoots[i] = depositRegisterTxRoots[i + 1];
            depositAccountRoots[i] = depositAccountRoots[i + 1];
        }
        depositRegisterTxRoots.pop();
        depositAccountRoots.pop();
        noDepositRegisterTx -= 4;
        emit sDepositRegister(true);
    }

    function update() private {}

    function mimcMultiHash(uint[] memory arr) public view returns (uint) {
        uint r = 0;
        for (uint i = 0; i < arr.length; i++) {
            r =
                (((r + mimc.MiMCpe7(arr[i] % prime, r)) % prime) +
                    (arr[i] % prime)) %
                prime;
        }
        return r;
    }
}
