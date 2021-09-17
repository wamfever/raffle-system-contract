const { expect } = require("chai");
const { ethers } = require("hardhat");


let prevMonths = 0;

function addMonth(month) {
  prevMonths += month;
  let blockchainTime = Math.round((new Date()).getTime() / 1000);
  blockchainTime = blockchainTime + (prevMonths * 30 * 86400);
  return blockchainTime;
}

describe("Buy tickets tests", function () {

    let deployerAccount;
    let raffleWorld;
    let testToken;

    before(async function () {
        const [deployer] = await ethers.getSigners();
        deployerAccount = deployer;
    });

    beforeEach(async function () {
        const RaffleWorld = await ethers.getContractFactory("RaffleWorld");
        raffleWorld = await RaffleWorld.deploy();

        const TestToken = await ethers.getContractFactory("TestToken");
        testToken = await TestToken.deploy("Test Token", "TKN1");
    });


    it("Shoud buy 3 tickets to the raffle", async function () {
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", "1663412417", testToken.address, "1000000000000", "10", "1000", "2");

        let redeedmTime = addMonth(13);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeedmTime]);
        await ethers.provider.send('evm_mine');

        await testToken.approve(raffleWorld.address, "3000");
        await expect(raffleWorld.buyTickets("0", "3"))
            .to.emit(raffleWorld, "BuyTickets").withArgs(deployerAccount.address, "0", "3");
    });

    it("Should not permit tickets purchasing because the raffle is canceled", async function() {
        let redeedmTime = addMonth(1);
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", redeedmTime, testToken.address, "1000000000000", "10", "1000", "2");
        await raffleWorld.cancelRaffle("0");

        redeedmTime = addMonth(1);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeedmTime]);
        await ethers.provider.send('evm_mine');

        await testToken.approve(raffleWorld.address, "3000");

        await expect(raffleWorld.buyTickets("0", "3"))
            .to.be.revertedWith("RaffleWolrd: this raffle is canceled!");     
    });

    it("Should not permit tickets purchasing because all the tickets were bought", async function() {
        let redeedmTime = addMonth(1);
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", redeedmTime, testToken.address, "1000000000000", "1", "1000", "2");

        redeedmTime = addMonth(1);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeedmTime]);
        await ethers.provider.send('evm_mine');

        await testToken.approve(raffleWorld.address, "3000");
        await raffleWorld.buyTickets("0", "1");

        await testToken.approve(raffleWorld.address, "3000");

        await expect(raffleWorld.buyTickets("0", "3"))
            .to.be.revertedWith("RaffleWorld: you need to buy less tickets");     
    });

    it("Should not permit tickets purchasing because the raffle has not started yet", async function () {
        let redeedmTime = addMonth(1);
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", redeedmTime, testToken.address, "1000000000000", "10", "1000", "2");

        await testToken.approve(raffleWorld.address, "3000");
        await expect(raffleWorld.buyTickets("0", "3"))
            .to.be.revertedWith("RaffleWorld: the raffle has not started yet");
    });

    it("Should not permit tickets purchasing because of the lack of allowance", async function() {
        let redeedmTime = addMonth(1);
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", redeedmTime, testToken.address, "1000000000000", "10", "1000", "2");

        redeedmTime = addMonth(1);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeedmTime]);
        await ethers.provider.send('evm_mine');

        await expect(raffleWorld.buyTickets("0", "3"))
            .to.be.revertedWith("RaffleWorld: you didn't provide enough tokens for the purchase to be made");     
    });
});