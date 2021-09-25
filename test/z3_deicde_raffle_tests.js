const { expect } = require("chai");
const { ethers } = require("hardhat");


let prevMonths = 0;

function addMonth(month) {
    prevMonths += month;
    let blockchainTime = Math.round((new Date()).getTime() / 1000);
    blockchainTime = blockchainTime + (prevMonths * 30 * 86400);
    return blockchainTime;
}

describe("Decide raffle tests", function () {

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


    it("Shoud decide the raffle and give the prize to the winner", async function () {
        let redeemTime = addMonth(200);
        await testToken.approve(raffleWorld.address, "100000000000000000");
        await testToken.transfer(secondaryAccount.address, "1000000000000");
        await raffleWorld.setRaffle("Test raffle", redeemTime, testToken.address, "100000000000000000", "5", "1000", "2");

        await expect(raffleWorld.addPercentage("0", "0", "10000"))
            .to.emit(raffleWorld, "AddPercentage").withArgs(deployerAccount.address, "0", "0", "10000");

        redeemTime = addMonth(13);
        await ethers.provider.send('evm_setNextBlockTimestamp', [redeemTime]);
        await ethers.provider.send('evm_mine');

        await testToken.approve(raffleWorld.address, "3000");
        await expect(raffleWorld.buyTickets("0", "3"))
            .to.emit(raffleWorld, "BuyTickets").withArgs(deployerAccount.address, "0", "3");

        await testToken.connect(secondaryAccount).approve(raffleWorld.address, "3000");

        const transaction = await raffleWorld.connect(secondaryAccount).buyTickets("0", "2");
        let tx_receipt = await transaction.wait();
        let requestId = tx_receipt.events[2].topics[0];
        await vrfCoordinatorMock.callBackWithRandomness(requestId, '777', raffleWorld.address);
        expect(await testToken.balanceOf(secondaryAccount.address)).to.equal('100000999999998000');
    });
});