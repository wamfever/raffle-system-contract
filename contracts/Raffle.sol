//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.6.12;

//libraries contracts
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Raffle {

    /*
        Raffle structure members:

            name (string) -> the name of the raffle

            startDate (uint256 timestamp) -> the date when users will be able to buy tickets for the raffle

            tokenAddress (address) -> address of the token wich will be used as currency for this raffle

            prizeAmount (uint256) -> the amount of tokens that will be shared among winners 
                                  -> the decimals of the prize should have the same length as the token's decimals

            ticketsLimit (uint256) -> the maximum number of tokens that can be bought

            ticketPrice (uint256) -> the price of one raffle ticket
                                  -> the decimals of the price should have the same length as the token's decimals
            
            lockDays (uint256) -> the number of days in wich the users will not be able to refund their tickets

            status (string) -> the status of the raffle: ongoing / ended
            
            canceled (bool) -> true if the raffle is canceled, false otherwise 
    */

    struct Raffle {
        string name;
        uint256 startDate;
        address tokenAddress;
        uint256 prizeAmount;
        uint256 ticketsLimit;
        uint256 ticketPrice;
        uint256 lockDays;
        string status;
        bool canceled;
        uint256 totalPercentage;
    }

    /* main raffles array */
    Raffle[] public raffles;

    /* active raffles array */
    Raffle[] public active_raffles;

    /* mapping from main raffles array index to active raffle index */
    mapping(uint256 => uint256) active_raffles_index;

}