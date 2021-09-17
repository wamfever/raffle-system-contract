const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Winning percentages tests", function () {

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


    it("Shoud add a percentage to one of the raffles", async function () {
        await testToken.approve(raffleWorld.address, "1000000000000");
        await expect(raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2"))
            .to.not.be.reverted;
        await expect(raffleWorld.addPercentage("0", "0", "2000"))
            .to.emit(raffleWorld, "AddPercentage").withArgs(deployerAccount.address, "0", "0", "2000");
    });

    it("Shoud not add a percentage to one of the raffles because it would exceed the maximum percentage", async function () {
        await testToken.approve(raffleWorld.address, "1000000000000");
        await expect(raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2"))
            .to.not.be.reverted;
        await expect(raffleWorld.addPercentage("0", "0", "200000"))
            .to.be.revertedWith("RaffleWorld: Total percentage should be less or equal with 100");
    });

    it("Should remove a percentage from one of the raffles", async function () {
        await testToken.approve(raffleWorld.address, "1000000000000");
        await expect(raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2"))
            .to.not.be.reverted;
        await raffleWorld.addPercentage("0", "0", "2000");
        await expect(raffleWorld.removePercentage("0", "0"))
            .to.emit(raffleWorld, "RemovePercentage").withArgs(deployerAccount.address, "0", "0");
    });

    it("Should not remove a percentage from one of the raffles because the index does not represents an occupied position", async function () {
        await testToken.approve(raffleWorld.address, "1000000000000");
        await expect(raffleWorld.setRaffle("Test raffle", "1663346190", testToken.address, "1000000000000", "10", "1000000000", "2"))
            .to.not.be.reverted;
        await raffleWorld.addPercentage("0", "0", "2000");
        await expect(raffleWorld.removePercentage("0", "1"))
            .to.be.revertedWith("RaffleWorld: the index does not represent an occupied poistion in the array");
    });
});