const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Activate and cancel raffle tests", function () {

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

    it("Should cancel the raffle", async function () {
        await testToken.approve(raffleWorld.address, "1000000000000");
        await expect(raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2")).to.not.be.reverted;
        await expect(raffleWorld.cancelRaffle(0)).to.emit(raffleWorld, "CancelRaffle").withArgs(deployerAccount.address, "0");
    });

    it("Should cancel then activate the raffle", async function () {
        await testToken.approve(raffleWorld.address, "1000000000000");
        await expect(raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2")).to.not.be.reverted;
        await expect(raffleWorld.cancelRaffle(0)).to.emit(raffleWorld, "CancelRaffle").withArgs(deployerAccount.address, "0");
        await expect(raffleWorld.activateRaffle(0)).to.emit(raffleWorld, "ActivateRaffle").withArgs(deployerAccount.address, "0");
    });

    it("Should revert because the raffle is already canceled", async function () {
        await testToken.approve(raffleWorld.address, "1000000000000");
        await expect(raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2")).to.not.be.reverted;
        await expect(raffleWorld.cancelRaffle(0)).to.emit(raffleWorld, "CancelRaffle").withArgs(deployerAccount.address, "0");
        await expect(raffleWorld.cancelRaffle(0)).to.be.revertedWith("Raffle World: raffle is already canceled!");
    });

    it("Should revert because the raffle is already activated", async function () {
        await testToken.approve(raffleWorld.address, "1000000000000");
        await expect(raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2")).to.not.be.reverted;
        await expect(raffleWorld.activateRaffle(0)).to.be.revertedWith("RaffleWorld: raffle is already active!");
    });

});