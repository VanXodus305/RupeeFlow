// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RupeeFlow
 * @dev Records settlement of EV charging payments on blockchain
 */
contract RupeeFlow {
    struct ChargingSettlement {
        address evOwner;
        address station;
        uint256 energyKwh;
        uint256 amountPaid;
        uint256 duration;
        uint256 timestamp;
    }

    event ChargingSettled(
        address indexed evOwner,
        address indexed station,
        uint256 energyKwh,
        uint256 amountPaid,
        uint256 duration,
        uint256 timestamp
    );

    mapping(bytes32 => ChargingSettlement) public settlements;
    ChargingSettlement[] public allSettlements;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function settleCharging(
        address _evOwner,
        address _station,
        uint256 _energyKwh,
        uint256 _amountPaid,
        uint256 _duration
    ) external {
        require(_evOwner != address(0), "Invalid EV owner");
        require(_station != address(0), "Invalid station");
        require(_energyKwh > 0, "Energy must be greater than 0");
        require(_amountPaid > 0, "Amount must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");

        bytes32 settlementId = keccak256(
            abi.encodePacked(_evOwner, _station, block.timestamp)
        );

        ChargingSettlement memory settlement = ChargingSettlement({
            evOwner: _evOwner,
            station: _station,
            energyKwh: _energyKwh,
            amountPaid: _amountPaid,
            duration: _duration,
            timestamp: block.timestamp
        });

        settlements[settlementId] = settlement;
        allSettlements.push(settlement);

        emit ChargingSettled(_evOwner, _station, _energyKwh, _amountPaid, _duration, block.timestamp);
    }

    function getSettlementCount() external view returns (uint256) {
        return allSettlements.length;
    }

    function getSettlement(uint256 _index) external view returns (ChargingSettlement memory) {
        require(_index < allSettlements.length, "Index out of bounds");
        return allSettlements[_index];
    }
}
