pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {
    string public name = "EthSwap ERC20 Token Exchange";
    Token public token;
    uint256 public rate = 100;

    event TokensPurchased(
        address buyer,
        address token,
        uint256 amount,
        uint256 rate
    );

    event TokensSold(
        address seller,
        address token,
        uint256 amount,
        uint256 rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        // calculate the number of tokens based on the ether sent
        uint256 tokenAmount = msg.value * rate;

        // require that the balance of ethSwap contract is greater than the amount that someone is trying to buy
        require(token.balanceOf(address(this)) >= tokenAmount);

        // transfer J4KE tokens to the buyer
        token.transfer(msg.sender, tokenAmount);

        // emit the TokenPurchased event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint256 tokenAmount) public {
        // User can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= tokenAmount);

        // Call the amount of Ether to send
        uint256 etherAmount = tokenAmount / rate;

        // Require that EthSwap has enough Ether
        require(address(this).balance >= etherAmount);

        token.transferFrom(msg.sender, address(this), tokenAmount);
        msg.sender.transfer(etherAmount);

        // Emit an event
        emit TokensSold(msg.sender, address(token), tokenAmount, rate);
    }
}
