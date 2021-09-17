async function main() {
    const RaffleWorld = await ethers.getContractFactory("RaffleWorld");
    const raffleWorld = await RaffleWorld.deploy(
        "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311",
        "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B",
        "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
        "100000000000000000"
    );
    console.log("RaffleWorld: " +  raffleWorld.address)
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });