require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const config = {
  solidity: {
    version: '0.8.22',
    settings: {
      viaIR: true, // Enable viaIR to handle stack too deep errors
      optimizer: {
        enabled: true,
        runs: 1, // Optimize for size instead of runtime gas efficiency
      },
    },
  },
  networks: {
    sepolia: {
      url:
        process.env.SEPOLIA_RPC_URL ||
        'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      timeout: 120000, // 2 minutes timeout
      gasPrice: 'auto',
      gas: 'auto',
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || '',
    },
  },
};

module.exports = config;
