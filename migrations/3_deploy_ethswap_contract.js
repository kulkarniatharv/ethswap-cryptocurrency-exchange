const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

module.exports = async function(deployer) {

  const tokenContract = await Token.deployed();

  await deployer.deploy(EthSwap, Token.address);
  const ethSwapContract = await EthSwap.deployed();

  // transfer all the tokens to ethswap contract. 
  // the acc that is sending the txn is the first acc in ganache
  await tokenContract.transfer(ethSwapContract.address, '1000000000000000000000000');
};