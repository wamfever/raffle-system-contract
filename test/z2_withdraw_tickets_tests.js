const { expect } = require("chai");
const { ethers } = require("hardhat");


let prevMonths = 0;

function addMonth(month) {
  prevMonths += month;
  let blockchainTime = Math.round((new Date()).getTime() / 1000);
  blockchainTime = blockchainTime + (prevMonths * 30 * 86400);
  return blockchainTime;
}

describe("Withdraw tickets tests", function () {

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

    it("Should buy 3 tickets to the raffle and withdraw them", async function () {
        let redeedmTime = addMonth(100);
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", redeedmTime, testToken.address, "1000000000000", "10", "1000", "0");

        redeedmTime = addMonth(13);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeedmTime]);
        await ethers.provider.send('evm_mine');

        await testToken.approve(raffleWorld.address, "3000");
        await expect(raffleWorld.buyTickets("0", "3"))
            .to.emit(raffleWorld, "BuyTickets").withArgs(deployerAccount.address, "0", "3");

        await expect(raffleWorld.withdrawTickets("0", "3"))
            .to.emit(raffleWorld, "WithdrawTickets").withArgs(deployerAccount.address, "0", "3");

        expect(await testToken.balanceOf(deployerAccount.address)).to.equal('999999999999000000000000');
    });

    it("Should buy 3 tickets to the raffle and withdraw 2 of them", async function () {
        let redeedmTime = addMonth(1);
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", redeedmTime, testToken.address, "1000000000000", "10", "1000", "0");

        redeedmTime = addMonth(13);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeedmTime]);
        await ethers.provider.send('evm_mine');

        await testToken.approve(raffleWorld.address, "3000");
        await expect(raffleWorld.buyTickets("0", "3"))
            .to.emit(raffleWorld, "BuyTickets").withArgs(deployerAccount.address, "0", "3");

        await expect(raffleWorld.withdrawTickets("0", "2"))
            .to.emit(raffleWorld, "WithdrawTickets").withArgs(deployerAccount.address, "0", "2");

        expect(await testToken.balanceOf(deployerAccount.address)).to.equal('999999999998999999999000');
    });

    it("Should not withdraw tickets because user doesn't have any", async function () {
        let redeedmTime = addMonth(1);
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", redeedmTime, testToken.address, "1000000000000", "10", "1000", "0");

        redeedmTime = addMonth(13);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeedmTime]);
        await ethers.provider.send('evm_mine');

        await expect(raffleWorld.withdrawTickets("0", "2"))
            .to.be.revertedWith("RaffleWorld: no tickets left!");

        expect(await testToken.balanceOf(deployerAccount.address)).to.equal('999999999999000000000000');
    });

    it("Should withdraw only avalible tickets", async function() {
        let redeedmTime = addMonth(1);
        await testToken.approve(raffleWorld.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", redeedmTime, testToken.address, "1000000000000", "10", "1000", "30");

        redeedmTime = addMonth(13);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeedmTime]);
        await ethers.provider.send('evm_mine');

        await testToken.approve(raffleWorld.address, "3000");
        await expect(raffleWorld.buyTickets("0", "2"))
            .to.emit(raffleWorld, "BuyTickets").withArgs(deployerAccount.address, "0", "2");

        redeedmTime = addMonth(2);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeedmTime]);
        await ethers.provider.send('evm_mine');

        await expect(raffleWorld.buyTickets("0", "1"))
            .to.emit(raffleWorld, "BuyTickets").withArgs(deployerAccount.address, "0", "1");

        await expect(raffleWorld.withdrawTickets("0", "3"))
            .to.emit(raffleWorld, "WithdrawTickets").withArgs(deployerAccount.address, "0", "2");

        expect(await testToken.balanceOf(deployerAccount.address)).to.equal('999999999998999999999000');
    });
});