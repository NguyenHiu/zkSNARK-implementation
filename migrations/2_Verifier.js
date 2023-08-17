var Verifier = artifacts.require("Groth16Verifier");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(Verifier);
};