require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.6.0',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },

  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_RINKEBY_TESNET_URL,
        accounts: {
          mnemonic:"test test test test test test test test test test test junk",
          initialIndex:0,
          path:"m/44'/60'/0'/0",
          count:20,
          accountsBalance:"10000000000000000000000"
        },
        timeout: 90000
      }
    },
    kovan: {
      url: process.env.ALCHEMY_RINKEBY_TESNET_URL,
      accounts: [ process.env.METAMASK_ACCOUNT_PRIVATE_KEY ]
    } 
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  mocha: {
    timeout: 90000
  }
};
