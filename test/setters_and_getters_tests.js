const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Raffle setters and getters tests", function () {

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
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2");
    });

    it("Should set the name of the raffle with the position 0 in the array", async function () {
        await expect(raffleWorld.setRaffleName("0", "random"))
            .to.emit(raffleWorld, "SetRaffleName").withArgs(deployerAccount.address, "0", "random");
    });

    it("Should set the start date of the raffle with the position 0 in the array", async function () {
        await expect(raffleWorld.setRaffleStartDate("0", "1800000000"))
            .to.emit(raffleWorld, "SetRaffleStartDate").withArgs(deployerAccount.address, "0", "1800000000");
    });


    it("Should set the start date of the raffle with the position 0 in the array and revert because the date is in the past", async function () {
        await expect(raffleWorld.setRaffleStartDate("0", "1568672067"))
            .to.be.revertedWith("RaffleWorld: raffle's start date should be in the future!");
    });

    it("Should set the prize amount of the raffle with the position 0 in the array", async function () {
        await expect(raffleWorld.setRafflePrizeAmount("0", "1000"))
            .to.emit(raffleWorld, "SetRafflePrizeAmount").withArgs(deployerAccount.address, "0", "1000");
    });

    it("Should set the prize amount of the raffle with the position 0 in the array and revert because the amount is 0", async function () {
        await expect(raffleWorld.setRafflePrizeAmount("0", "0"))
            .to.be.revertedWith("RaffleWorld: raffle's prize amount should be greater than 0!");
    });

    it("Should set the tickets limit of the raffle with the position 0 in the array", async function () {
        await expect(raffleWorld.setRaffleTicketsLimit("0", "1000"))
            .to.emit(raffleWorld, "SetRaffleTicketsLimit").withArgs(deployerAccount.address, "0", "1000");
    });

    it("Should set the tickets limit of the raffle with the position 0 in the array and revert because the limit is 0", async function () {
        await expect(raffleWorld.setRaffleTicketsLimit("0", "0"))
            .to.be.revertedWith("RaffleWorld: raffle's tickets limit should be greater than 0!");
    });

    it("Should set the ticket price of the raffle with the position 0 in the array", async function () {
        await expect(raffleWorld.setRaffleTicketPrice("0", "1000"))
            .to.emit(raffleWorld, "SetRaffleTicketPrice").withArgs(deployerAccount.address, "0", "1000");
    });

    it("Should set the lock days of the raffle with the position 0 in the array", async function () {
        await expect(raffleWorld.setRaffleLockDays("0", "1000"))
            .to.emit(raffleWorld, "SetRaffleLockDays").withArgs(deployerAccount.address, "0", "1000");
    });

    it("Should return the length of the raffles array", async function () {
        await testToken.approve(raffleWorld.address, "1000000000000");
        await linkToken.approve(raffleWorld.address, "100000000000000000");
        await raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2");
        await testToken.approve(raffleWorld.address, "1000000000000");
        await linkToken.approve(raffleWorld.address, "100000000000000000");
        await raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2");
        expect(await raffleWorld.getRafflesLength()).to.equal('3');
    });

    it("Should return the length of the active raffle array", async function () {
        await testToken.approve(raffleWorld.address, "1000000000000");
        await linkToken.approve(raffleWorld.address, "100000000000000000");
        await raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2");
        await testToken.approve(raffleWorld.address, "1000000000000");
        await linkToken.approve(raffleWorld.address, "100000000000000000");
        await raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2");
        await raffleWorld.cancelRaffle('0');
        expect(await raffleWorld.getActiveRafflesLength()).to.equal('2');
    });

    it("Should return the length of the active raffle array", async function () {
        await testToken.approve(raffleWorld.address, "1000000000000");
        await linkToken.approve(raffleWorld.address, "100000000000000000");
        await raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2");
        await testToken.approve(raffleWorld.address, "1000000000000");
        await linkToken.approve(raffleWorld.address, "100000000000000000");
        await raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2");
        await raffleWorld.cancelRaffle('0');
        await raffleWorld.activateRaffle('0');
        expect(await raffleWorld.getActiveRafflesLength()).to.equal('3');
    });
});