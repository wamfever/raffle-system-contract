//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.6.12;

//libraries contracts
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "hardhat/console.sol";

contract RaffleWorld is Ownable {

    using SafeMath for uint;

    event SetRaffle(
        address indexed user,
        string _name,
        uint256 _startDate,
        address _tokenAddress,
        uint256 _prizeAmount,
        uint256 _ticketsLimit,
        uint256 _ticketPrice,
        uint256 _lockDays,
        string _status,
        bool _canceled
    );

    event ActivateRaffle(
        address indexed user,
        uint256 indexed _raffleId
    );

    event CancelRaffle(
        address indexed user,
        uint256 indexed _raffleId
    );

    event SetRaffleName(
        address indexed user,
        uint256 indexed _raffleId,
        string _name
    );

    event SetRaffleStartDate(
        address indexed user,
        uint256 indexed _raffleId,
        uint256 _startDate
    );

    event SetRaffleTokenAddress(
        address indexed user,
        uint256 indexed _raffleId,
        address _tokenAddress
    );

    event SetRafflePrizeAmount(
        address indexed user,
        uint256 indexed _raffleId,
        uint256 _prizeAmount
    );

    event SetRaffleTicketsLimit(
        address indexed user,
        uint256 indexed _raffleId,
        uint256 _ticketsLimit
    );

    event SetRaffleTicketPrice(
        address indexed user,
        uint256 indexed _raffleId,
        uint256 _ticketPrice
    );

    event SetRaffleLockDays(
        address indexed user,
        uint256 indexed _raffleId,
        uint256 _lockDays
    );

    event SetRaffleStatus(
        address indexed user,
        uint256 indexed _raffleId,
        string _status
    );

    modifier beforeRaffleStart(uint256 _raffleId) {
        require(
            block.timestamp < raffles[_raffleId].startDate,
            "RaffleWorld: you cannot update raffle parameters after it has started!"
        );
        _;
    }

    /*
        @dev Raffle structure members:

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
    uint256[] public active_raffles;

    /* mapping from main raffles array index to active raffle index */
    mapping(uint256 => uint256) active_raffles_index;

    function _checkRaffleParameters(uint256 _startDate, uint256 _prizeAmount, uint256 _ticketsLimit) internal view {
        require(_startDate > block.timestamp, "RaffleWorld: raffle's start date should be in the future!");
        require(_prizeAmount > 0, "RaffleWorld: raffle's prize amount should be greater than 0!");
        require(_ticketsLimit > 0, "RaffleWorld: raffle's tickets limit should be greater than 0!");
    }

    function setRaffle(
        string memory _name,
        uint256 _startDate,
        address _tokenAddress,
        uint256 _prizeAmount,
        uint256 _ticketsLimit,
        uint256 _ticketPrice,
        uint256 _lockDays
    ) public onlyOwner {

        _checkRaffleParameters(_startDate, _prizeAmount, _ticketsLimit);

        //check if the owner has allowed enough raffle tokens for the prize pool
        IERC20 raffleToken = IERC20(_tokenAddress);
        require(
            raffleToken.allowance(_msgSender(), address(this)) >= _prizeAmount,
            "RaffleWorld: Insufficient tokens for prize poll"
        );
        raffleToken.transferFrom(_msgSender(), address(this), _prizeAmount);

        //add raffle to the main array 
        raffles.push(
            Raffle({
                name: _name,
                startDate: _startDate,
                tokenAddress: _tokenAddress,
                prizeAmount: _prizeAmount,
                ticketsLimit: _ticketsLimit,
                ticketPrice: _ticketPrice,
                lockDays: _lockDays,
                status: "ongoing",
                //pushing the raffle as canceled so activateRaffle function will not revert
                canceled: true,
                totalPercentage: 0
            })
        );
        
        //activating the last raffle in the array
        activateRaffle(raffles.length - 1);

        emit SetRaffle(
            _msgSender(),
            _name,
            _startDate,
            _tokenAddress,
            _prizeAmount,
            _ticketsLimit,
            _ticketPrice,
            _lockDays,
            "ongoing",
            false
        );
    }

    function activateRaffle(uint256 _raffleId) public onlyOwner {
        require(raffles[_raffleId].canceled == true, "RaffleWorld: raffle is already active!");
        raffles[_raffleId].canceled = false;
        active_raffles.push(raffles.length - 1);
        active_raffles_index[raffles.length - 1] = active_raffles.length - 1;
        emit ActivateRaffle(_msgSender(), _raffleId);
    }

    function cancelRaffle(uint256 _raffleId) public onlyOwner {
        require(active_raffles_index[_raffleId] != uint256(-1), "Raffle World: raffle is already canceled!");

        raffles[_raffleId].canceled = true;

        //index from active_raffles of the raffle pointed by _raffleId
        uint256 current_raffle_index = active_raffles_index[_raffleId];
        //index from active raffles of the last raffle from the array
        uint256 last_active_raffle_index = active_raffles_index[active_raffles[active_raffles.length - 1]];

        //replace the value pointed by the index of the current_raffle (the index of the raffle from the raffles array) with the value pointed
        //by last_active_raffle_index (the index from raffles of the last raffle from active_raffles array) 
        active_raffles[current_raffle_index] = active_raffles[last_active_raffle_index];

        //replacing the value pointed by the index of the last active raffle with the value pointed by the index of the current raffle 
        active_raffles_index[active_raffles[active_raffles.length - 1]] = active_raffles_index[_raffleId];
        //replacing the value pointed by _raffleId with a position that is not occupied in the active_raffles array
        active_raffles_index[_raffleId] = uint256(-1); 

        //removing the last raffle from active_raffles array because it has been moved on the current_raffle_index position
        active_raffles.pop();

        emit CancelRaffle(_msgSender(), _raffleId);
    }

    function setRaffleName(uint256 _raffleId, string memory _name) public onlyOwner beforeRaffleStart(_raffleId) {
        raffles[_raffleId].name = _name;
        emit SetRaffleName(_msgSender(), _raffleId, _name);
    }        

    function setRaffleStartDate(uint256 _raffleId, uint256 _startDate) public onlyOwner beforeRaffleStart(_raffleId) {
        require(_startDate > block.timestamp, "RaffleWorld: raffle's start date should be in the future!");
        raffles[_raffleId].startDate = _startDate;
        emit SetRaffleStartDate(_msgSender(), _raffleId, _startDate);
    }

    function setRafflePrizeAmount(uint256 _raffleId, uint256 _prizeAmount) public onlyOwner beforeRaffleStart(_raffleId) {
        require(_prizeAmount > 0, "RaffleWorld: raffle's prize amount should be greater than 0!");
        raffles[_raffleId].prizeAmount = _prizeAmount;
        emit SetRafflePrizeAmount(_msgSender(), _raffleId, _prizeAmount);
    }

    function setRaffleTicketsLimit(uint256 _raffleId, uint256 _ticketsLimit) public onlyOwner beforeRaffleStart(_raffleId) {
        require(_ticketsLimit > 0, "RaffleWorld: raffle's tickets limit should be greater than 0!");
        raffles[_raffleId].ticketsLimit = _ticketsLimit;
        emit SetRaffleTicketsLimit(_msgSender(), _raffleId, _ticketsLimit);
    }

    function setRaffleTicketPrice(uint256 _raffleId, uint256 _ticketPrice) public onlyOwner beforeRaffleStart(_raffleId) {
        raffles[_raffleId].ticketPrice = _ticketPrice;
        emit SetRaffleTicketPrice(_msgSender(), _raffleId, _ticketPrice);
    }

    function setRaffleLockDays(uint256 _raffleId, uint256 _lockDays) public onlyOwner beforeRaffleStart(_raffleId) {
        raffles[_raffleId].lockDays = _lockDays;
        emit SetRaffleLockDays(_msgSender(), _raffleId, _lockDays);
    }

    function _setRaffleStatus(uint256 _raffleId, string memory _status) internal {
        raffles[_raffleId].status = _status;
        emit SetRaffleStatus(_msgSender(), _raffleId, _status);
    } 

    function getRafflesLength() public view returns(uint256) {
        return raffles.length;
    }

    function getActiveRafflesLength() public view returns(uint256) {
        return active_raffles.length;
    }
}