const SensorData = artifacts.require("SensorData");

module.exports = function (deployer) {
    deployer.deploy(SensorData);
};
