const { assert } = require('chai');

const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

require('chai')
    .use(require('chai-as-promised'))
    .should()


function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('EthSwap', ([buyerAcc]) => {
    let token, ethSwap;

    before(async () => {
        token = await Token.new();
        ethSwap = await EthSwap.new(token.address);
        // transfer all the tokens to ethswap contract. 
        // the acc that is sending the txn is the first acc in ganache
        await token.transfer(ethSwap.address, '1000000000000000000000000');
    })

    describe('Deployment', async () => {

        describe('Token', async () => {
            it('contract has a name', async () => {
                const name = await token.name();
                assert.equal(name, 'Jake Token');
            });
    
            it('checking ethSwap contract balance', async () => {
                const balance = await token.balanceOf(ethSwap.address);
                assert.equal(balance.toString(), tokens('1000000'));
            });
        });

        describe('EthSwap', async () => {
            it('contract has a name', async () => {
                const name = await ethSwap.name();
                assert.equal(name, "EthSwap ERC20 Token Exchange");
            });
        })
    });

    describe('EthSwap contract', async () => {
        describe('Buy tokens with ether', async () => {
            let result;

            before(async () => {
                // Call the buyTokens function from the contract and pass in msg.sender and msg.value to the function
                // Convert 1 ether to Wei. 
                // Can't use tokens(n) because that is for our ERC20 token and not ether even though they do the same thing
                result = await ethSwap.buyTokens({from: buyerAcc, value: web3.utils.toWei('1', 'ether') });
            })

            it('Check balances of involved parties', async () => {
                const tokenBalanceBuyer = await token.balanceOf(buyerAcc);
                assert.equal(tokenBalanceBuyer.toString(), tokens('100'));

                const tokenBalanceEthSwap = await token.balanceOf(ethSwap.address);
                assert.equal(tokenBalanceEthSwap.toString(), tokens('999900'));

                const etherBalance = await web3.eth.getBalance(ethSwap.address);
                assert.equal(etherBalance.toString(), web3.utils.toWei('1', 'ether'));

                // Check logs to ensure event was emitted with correct data
                // const event = result.logs[0].args
                // assert.equal(event.account, buyerAcc)
                // assert.equal(event.token, token.address)
                // assert.equal(event.amount.toString(), tokens('100').toString())
                // assert.equal(event.rate.toString(), '100')
            })
        })


        describe("Sell tokens for ether", async () => {
            let result;

            before(async () => {
                await token.approve(ethSwap.address, tokens('100'), { from: buyerAcc });

                result = await ethSwap.sellTokens(tokens('100'), {from: buyerAcc});
            })

            it('Check balances of involved parties', async () => {
                let sellerTokenBalance = await token.balanceOf(buyerAcc); 
                assert.equal(sellerTokenBalance.toString(), tokens('0'));

                let ethSwapTokenBalance = await token.balanceOf(ethSwap.address);
                assert.equal(ethSwapTokenBalance, tokens('1000000'));

                let ethSwapEtherBalance = await web3.eth.getBalance(ethSwap.address);
                assert.equal(ethSwapEtherBalance, web3.utils.toWei('0', 'ether'));

                // Check logs to ensure event was emitted with correct data
                // const event = result.logs[0].args;
                // assert.equal(event.account, buyerAcc);
                // assert.equal(event.token, token.address);
                // assert.equal(event.amount.toString(), tokens('100').toString());
                // assert.equal(event.rate.toString(), '100');

                // Try to sell more tokens than the buyerAcc has
                await ethSwap.sellTokens(tokens('500'), {from: buyerAcc}).should.be.rejected;
            })
        })
    })
})