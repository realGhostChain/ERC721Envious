const path = require("path");
require('dotenv').config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const privateKey = process.env.PRIVATE_KEY;

module.exports = {

  networks: {
    local: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
    goerli: {
	 provider: () => new HDWalletProvider(privateKey, `wss://eth-goerli.g.alchemy.com/v2/${process.env.GOERLI_KEY}`),
     network_id: 5,
     timeoutBlocks: 200,
     confirmations: 2,
     gasPrice: 1000000000, // https://stats.goerli.net/
     skipDryRun: true,
     websockets: true,
    },
    ethereum: {
	 provider: () => new HDWalletProvider(privateKey, `wss://eth-mainnet.g.alchemy.com/v2/${process.env.ETHEREUM_KEY}`),
     network_id: 1,
     timeoutBlocks: 200,
     confirmations: 2,
     gasPrice: 1000000000, // https://ethgasstation.info/
     skipDryRun: true,
     websockets: true,
    },
    classic: {
	 provider: () => new HDWalletProvider(privateKey, `https://etc.rivet.link`), // https://chainlist.org/chain/61
     network_id: 61,
     timeoutBlocks: 200,
     confirmations: 2,
     gasPrice: 1000000000, // https://blockscout.com/etc/mainnet/  ||  https://etcblockexplorer.com/  ||  https://etc-network.info/
     skipDryRun: true,
     websockets: true,
    },
    polygon: {
	 provider: () => new HDWalletProvider(privateKey, `https://polygon-rpc.com`),
     networkCheckTimeout: 10000, 
     network_id: 137,
     timeoutBlocks: 200,
     confirmations: 2,
     gasPrice: 10000000000, // https://polygonscan.com/gastracker
     skipDryRun: true,
    },
    avalanche: {
	 provider: () => new HDWalletProvider(privateKey, `https://api.avax.network/ext/bc/C/rpc`),
     networkCheckTimeout: 10000, 
     network_id: 43114,
     timeoutBlocks: 200,
     confirmations: 2,
     gasPrice: 30000000000, // https://snowtrace.io/gastracker
     skipDryRun: true,
    },
    binance: {
	 provider: () => new HDWalletProvider(privateKey, `https://bsc-dataseed.binance.org`),
     networkCheckTimeout: 10000, 
     network_id: 56,
     timeoutBlocks: 200,
     confirmations: 2,
     gasPrice: 5000000000, // https://bscscan.com/gastracker
     skipDryRun: true,
    },
    fantom: {
	 provider: () => new HDWalletProvider(privateKey, `https://www.ankr.com/rpc/fantom/`), // https://docs.fantom.foundation/api/public-api-endpoints
     networkCheckTimeout: 10000, 
     network_id: 250,
     timeoutBlocks: 200,
     confirmations: 2,
     gasPrice: 5000000000, // https://ftmscan.com/gastracker
     skipDryRun: true,
    },
    celo: {
	 provider: () => new HDWalletProvider(privateKey, `https://forno.celo.org`), // https://docs.celo.org/network/node/forno
     networkCheckTimeout: 10000, 
     network_id: 42220,
     timeoutBlocks: 200,
     confirmations: 2,
     gasPrice: 5000000000, // https://cointool.app/gasPrice/celo
     skipDryRun: true,
    },
    moonbeam: {
	 provider: () => new HDWalletProvider(privateKey, `https://1rpc.io/glmr`), // https://docs.moonbeam.network/builders/get-started/endpoints/
     networkCheckTimeout: 10000, 
     network_id: 1284,
     timeoutBlocks: 200,
     confirmations: 2,
     gasPrice: 5000000000, // https://moonscan.io/gastracker
     skipDryRun: true,
    },
    harmony: {
	 provider: () => new HDWalletProvider(privateKey, `https://api.harmony.one`), // https://docs.harmony.one/home/general/ecosystem/wallets/browser-extensions-wallets/metamask-wallet/adding-harmony
     networkCheckTimeout: 10000, 
     network_id: 1666600000,
     timeoutBlocks: 200,
     confirmations: 2,
     gasPrice: 5000000000, // https://cointool.app/gasPrice/one
     skipDryRun: true,
    },
    iotex: {
	 provider: () => new HDWalletProvider(privateKey, `https://babel-api.mainnet.iotex.io`), // https://docs.iotex.io/dapp-development/web3-development/rpc-endpoints
     networkCheckTimeout: 10000, 
     network_id: 4689,
     timeoutBlocks: 200,
     confirmations: 2,
     gasPrice: 5000000000, // https://cointool.app/gasPrice/iotx
     skipDryRun: true,
    },
    metis: {
	 provider: () => new HDWalletProvider(privateKey, `https://andromeda.metis.io/?owner=1088`), // https://docs.metis.io/dev/get-started/metis-connection-details 
     networkCheckTimeout: 10000, 
     network_id: 1088,
     timeoutBlocks: 200,
     confirmations: 2,
     gasPrice: 5000000000, // ???? 
     skipDryRun: true,
    },
    astar: {
	 provider: () => new HDWalletProvider(privateKey, `https://evm.astar.network/`), // https://docs.astar.network/docs/quickstart/endpoints/
     networkCheckTimeout: 10000, 
     network_id: 592,
     timeoutBlocks: 200,
     confirmations: 2,
     gasPrice: 5000000000, // ???
     skipDryRun: true,
    },
  },

  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      excludeContracts: ['Migrations']
    }
  },

  compilers: {
    solc: {
      version: "0.8.4",
      settings: {
       optimizer: {
         enabled: true,
         runs: 1337
       },
       evmVersion: "berlin"
      }
    }
  },

  plugins: ["solidity-coverage", "truffle-plugin-verify", "truffle-contract-size"],

  api_keys: {
    etherscan: process.env.ETHERSCAN_API,
    polygonscan: process.env.POLYGONSCAN_API,
    snowtrace: process.env.SNOWTRACE_API,
    bscscan: process.env.BINANCESCAN_API,
    ftmscan: process.env.FTMSCAN_API,
    moonscan: process.env.MOONSCAN_API,
    celoscan: process.env.CELOSCAN_API,
  },
};