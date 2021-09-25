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
    let secondaryAccount;
    let raffleWorld;
    let testToken;

    before(async function () {
        const [deployer, secondary] = await ethers.getSigners();
        deployerAccount = deployer;
        secondaryAccount = secondary;
    });

    beforeEach(async function () {
        const LinkToken = await ethers.getContractFactory("MockLink");
        linkToken = await LinkToken.deploy();

        const VRFCoordinatorMock = await ethers.getContractFactory('VRFCoordinatorMock');
        vrfCoordinatorMock = await VRFCoordinatorMock.deploy(linkToken.address);

        const RaffleWorld = await ethers.getContractFactory("RaffleWorld");
        raffleWorld = await RaffleWorld.deploy(
            "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311",
            vrfCoordinatorMock.address,
            linkToken.address,
            "100000000000000000"
        );

        const TestToken = await ethers.getContractFactory("TestToken");
        testToken = await TestToken.deploy("Test Token", "TKN1");

        await linkToken.approve(raffleWorld.address, "100000000000000000");
    });

    it("Should buy 3 tickets to the raffle", async function () {
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", "1663412417", testToken.address, "1000000000000", "10", "1000", "2");

        let redeemTime = addMonth(13);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeemTime]);
        await ethers.provider.send('evm_mine');

        await testToken.approve(raffleWorld.address, "3000");
        await expect(raffleWorld.buyTickets("0", "3"))
            .to.emit(raffleWorld, "BuyTickets").withArgs(deployerAccount.address, "0", "3");
    });

    it("Should not permit tickets purchasing because the raffle is canceled", async function() {
        let redeemTime = addMonth(1);
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", redeemTime, testToken.address, "1000000000000", "10", "1000", "2");
        await raffleWorld.cancelRaffle("0");

        redeemTime = addMonth(1);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeemTime]);
        await ethers.provider.send('evm_mine');

        await testToken.approve(raffleWorld.address, "3000");

        await expect(raffleWorld.buyTickets("0", "3"))
            .to.be.revertedWith("RaffleWolrd: this raffle is canceled!");     
    });

    it("Should not permit tickets purchasing because all the tickets were bought", async function() {
        let redeemTime = addMonth(1);
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", redeemTime, testToken.address, "1000000000000", "1", "1000", "2");

        redeemTime = addMonth(1);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeemTime]);
        await ethers.provider.send('evm_mine');

        await testToken.approve(raffleWorld.address, "3000");
        await raffleWorld.buyTickets("0", "1");

        await testToken.approve(raffleWorld.address, "3000");

        await expect(raffleWorld.buyTickets("0", "3"))
            .to.be.revertedWith("RaffleWorld: you need to buy less tickets");     
    });

    it("Should not permit tickets purchasing because the raffle has not started yet", async function () {
        let redeemTime = addMonth(1);
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", redeemTime, testToken.address, "1000000000000", "10", "1000", "2");

        await testToken.approve(raffleWorld.address, "3000");
        await expect(raffleWorld.buyTickets("0", "3"))
            .to.be.revertedWith("RaffleWorld: the raffle has not started yet");
    });

    it("Should not permit tickets purchasing because of the lack of allowance", async function() {
        let redeemTime = addMonth(1);
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", redeemTime, testToken.address, "1000000000000", "10", "1000", "2");

        redeemTime = addMonth(1);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeemTime]);
        await ethers.provider.send('evm_mine');

        await expect(raffleWorld.buyTickets("0", "3"))
            .to.be.revertedWith("RaffleWorld: you didn't provide enough tokens for the purchase to be made");     
    });
});