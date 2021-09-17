const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Activate and cancel raffle tests", function () {

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