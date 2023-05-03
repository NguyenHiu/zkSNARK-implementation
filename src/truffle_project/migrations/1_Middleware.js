var MyContract = artifacts.require("Middleware");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(MyContract);
};