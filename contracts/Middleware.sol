pragma solidity ^0.8.0;

interface IMiMC {
    function MiMCpe7(uint256, uint256) external pure returns (uint256);
}

interface IDepositRegisterVerifier {
    function verifyProof(
        uint[2] calldata,
        uint[2][2] calldata,
        uint[2] calldata,
        uint[3] calldata
    ) external returns (bool);
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
    bytes32[] accountRoots;
    address coordinator;
    IMiMC public mimc;
    IDepositRegisterVerifier public dpVerifier; // dp - deposit register

    // deposit register variables
    bytes32[] depositAccountRoots;
    bytes32[] depositTxRoots;
    uint noDepositRegisterTx;

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
        bytes32 fromX,
        bytes32 fromY,
        bytes32 toX,
        bytes32 toY,
        uint amount,
        bytes32 r,
        bytes32 s,
        uint8 v
    );

    constructor(
        address _mimcContractAddress,
        // ,
        // address _depositRegisterVerifierContractAddress
        bytes32 initializationAccountRoot
    ) {
        mimc = IMiMC(_mimcContractAddress);
        // dpVerifier = IDepositRegisterVerifier(
        //     _depositRegisterVerifierContractAddress
        // );
        noDepositRegisterTx = 0;
        coordinator = msg.sender;
        accountRoots.push(initializationAccountRoot);
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
        address receiverAddress = address(
            bytes20((keccak256(abi.encodePacked(toX, toY))) << 96)
        );

        if (existedPubkeys[receiverAddress]) {
            emit dDebug(false);
        } else {
            existedPubkeys[receiverAddress] = true;
            _depositRegister(fromX, fromY, toX, toY, amount, r, s, v);
        }
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
        noDepositRegisterTx += 1;

        // create a new account
        // uint[] memory accountProperties = new uint[](4);
        // accountProperties[0] = uint(toX);
        // accountProperties[1] = uint(toY);
        // accountProperties[2] = amount;
        // accountProperties[3] = 0;
        // uint newAccountHash = uint(mimcMultiHash(accountProperties));

        // create a new tx
        uint[] memory txPropertes = new uint[](6);
        txPropertes[0] = uint(fromX);
        txPropertes[1] = uint(fromY);
        txPropertes[2] = uint(toX);
        txPropertes[3] = uint(toY);
        txPropertes[4] = 0;
        txPropertes[5] = amount;
        uint newTxHash = uint(mimcMultiHash(txPropertes));

        // emit dGetBytes32(bytes32(newTxHash));

        emit eDepositRegister(fromX, fromY, toX, toY, amount, r, s, v);

        // // re-hash root
        // uint tmp1 = newAccountHash;
        // uint tmp2 = newTxHash;
        // uint _noTx = noDepositRegisterTx;
        // while (_noTx % 2 == 0) {
        //     _noTx /= 2;
        //     uint[] memory inputArray = new uint[](2);
        //     inputArray[0] = uint(
        //         depositAccountRoots[depositAccountRoots.length - 1]
        //     );
        //     inputArray[1] = tmp1;
        //     depositAccountRoots.pop();
        //     tmp1 = mimcMultiHash(inputArray);

        //     inputArray[0] = uint(
        //         depositTxRoots[depositTxRoots.length - 1]
        //     );
        //     inputArray[1] = tmp2;
        //     depositTxRoots.pop();
        //     tmp2 = mimcMultiHash(inputArray);
        // }
        // depositAccountRoots.push(bytes32(tmp1));
        // depositTxRoots.push(bytes32(tmp2));
    }

    function getDepositRegisterRoot() public {
        emit dGetBytes32(depositAccountRoots[0]);
    }

    function verifyProof_DepositRegister(
        uint[2] calldata pi_a,
        uint[2][2] calldata pi_b,
        uint[2] calldata pi_c,
        uint[3] calldata publicSignals
    ) public returns (bool) {
        emit dGetBytes32(depositAccountRoots[0]);
        // require(depositRegisterRoots[0] == bytes32(publicSignals[1]), "Deposit Register Root is invalid!");
        emit dGetBytes32(accountRoots[0]);
        // require(accountRoots[0] == bytes32(publicSignals[2]), "Account Root is invalid!");
    }

    function mimcMultiHash(uint[] memory arr) public returns (uint) {
        uint r = 0;
        for (uint i = 0; i < arr.length; i++) {
            // emit dGetBytes32(bytes32(r));
            r =
                (((r + mimc.MiMCpe7(arr[i] % prime, r)) % prime) +
                    (arr[i] % prime)) %
                prime;
        }
        return r;
    }
}
