// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("Add raffle tests", function () {

//     let deployerAccount;
//     let raffleWorld;
//     let testToken;

//     before(async function () {
//         const [deployer] = await ethers.getSigners();
//         deployerAccount = deployer;
//     });

//     beforeEach(async function () {
//         const RaffleWorld = await ethers.getContractFactory("RaffleWorld");
//         raffleWorld = await RaffleWorld.deploy();

//         const TestToken = await ethers.getContractFactory("TestToken");
//         testToken = await TestToken.deploy("Test Token", "TKN1");

//     });

//     it("Should not add a raffle to the raffles array because raffle start day is beyond block timestamp", async function () {
//         await expect(raffleWorld.setRaffle("Test raffle", "1596663323", testToken.address, "1000000000000", "10", "1000000000", "2"))
//             .to.be.revertedWith("RaffleWorld: raffle's start date should be in the future!");
//     });

//     it("Should not add a raffle to the raffles array because the prize amount is 0", async function () {
//         await expect(raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "0", "10", "1000000000", "2"))
//             .to.be.revertedWith("RaffleWorld: raffle's prize amount should be greater than 0!");
//     });

//     it("Should not add a raffle to the raffles array because the tickets limit is 0", async function () {
//         await expect(raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "0", "1000000000", "2"))
//             .to.be.revertedWith("RaffleWorld: raffle's tickets limit should be greater than 0!");
//     });

//     it("Should not add a raffle to the raffles array because the contract doesn't have allowance for the prize amount", async function () {
//         await expect(raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2"))
//             .to.be.revertedWith("RaffleWorld: Insufficient tokens for prize poll");
//     });

//     it("Shoud add a raffle to the raffles array", async function () {
//         await testToken.approve(raffleWorld.address, "1000000000000");
//         await expect(raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2")).to.not.be.reverted;
//     });
// })