// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SensorData {
    struct Reading {
        uint256 temperature; // Stored as an integer (e.g., 2467 for 24.67°C)
        uint256 humidity;    // Stored as an integer (e.g., 5589 for 55.89%)
        uint256 timestamp;
    }

    Reading[] public readings;
    event DataStored(uint256 temperature, uint256 humidity, uint256 timestamp);

    function storeData(uint256 _temperature, uint256 _humidity) public {
        readings.push(Reading(_temperature, _humidity, block.timestamp));
        emit DataStored(_temperature, _humidity, block.timestamp);
    }

    function getLatestReading() public view returns (uint256, uint256, uint256) {
        require(readings.length > 0, "No data stored yet!");
        Reading storage lastReading = readings[readings.length - 1];
        return (lastReading.temperature, lastReading.humidity, lastReading.timestamp);
    }
}
