# Blockchain Raffle Project

This is an raffle mechanism project for testing purposes

# Description
This contract implements a simple raffle mechanism on the blockchain.

## The public functions that users can interact with:
```shell
buyTickets 
``` 
- used to buy tokens after the raffle has started, don't forget to add allowance for the contract before purchasing
```shell
withdrawTickets
``` 
- used to refund the purchased tickets after "lockDays" days have passed from the day the tickets were bought

## Public variables that users can interact with:
```shell
raffles
```
- raffles array
```shell
active_raffles
```
- active raffles array
```shell
percentagesToWin
```
- map that stores for every raffle how the prize will be divided between winners
```shell
raffleTickets
```
- map that stores for every raffle the tickets that were bought
```shell
userTickets
```
- map that stores for every user the indices of the tickets that he bought, based on raffle id
# Testing points
* solidity knowledge
* hardhat development enviroment
* openzepelin
* chainlink
* usage of openzeppelin util libraries
* implementation of a smart contracts
* testing smart contracts
* understanding good practices of blockchain development (optimal amount of data stored on chain, fixed point precision computation)

# Usage

## 1. Installing packages
To install the packages use the following command:
```shell
npm install
```

## 2. Run the tests
To run the tests use the following command:
```shell
npx hardhat test
```
## 3. Deploy the contract to rinkeby testnet
To deploy on public network (testing or mainnet) you must define a new network connection in hardhat.config.js like rinkeby network. Don't forget to change alchemy account (ALCHEMY_RINKEBY_TESNET_URL), and ethereum secured private key (METAMASK_ACCOUNT_PRIVATE_KEY) in the .env file

```shell
npx hardhat run --network rinkeby scripts/raffle_world_deploy.js
```

## 4. Verify the contract on rinkeby tesnet
Don't forget to change etherscan api key (ETHERSCAN_API_KEY)
```shell
npx hardhat verify --network rinkeby CONTRACT_ADDRESS  "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311" "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B" "0x01BE23585060835E02B77ef475b0Cc51aA1e0709" "100000000000000000" 
```
