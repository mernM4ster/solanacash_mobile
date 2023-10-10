const supportedChains = [
  {
    name: "Ethereum Mainnet",
    short_name: "eth",
    chain: "ETH",
    network: "mainnet",
    chain_id: 1,
    network_id: 1,
    rpc_url: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    native_currency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  },
  {
    name: "Ethereum Görli",
    short_name: "gor",
    chain: "ETH",
    network: "goerli",
    chain_id: 5,
    network_id: 5,
    rpc_url: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    native_currency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  },
  {
    name: "Binance Smart Chain",
    short_name: "bsc",
    chain: "smartchain",
    network: "mainnet",
    chain_id: 56,
    network_id: 56,
    rpc_url: "https://bsc-dataseed1.defibit.io/",
    native_currency: {
      symbol: "BNB",
      name: "BNB",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  },
  {
    name: "Binance Smart Chain - Testnet",
    short_name: "bsc",
    chain: "smartchain",
    network: "mainnet",
    chain_id: 97,
    network_id: 97,
    rpc_url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    native_currency: {
      symbol: "BNB",
      name: "BNB",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  },
  {
    name: "Polygon Mainnet",
    short_name: "matic",
    chain: "smartchain",
    network: "mainnet",
    chain_id: 137,
    network_id: 137,
    rpc_url: "	https://polygon-rpc.com/",
    native_currency: {
      symbol: "Matic",
      name: "Matic",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  },
  {
    name: "Polygon - Testnet",
    short_name: "matic",
    chain: "smartchain",
    network: "testnet",
    chain_id: 80001,
    network_id: 80001,
    rpc_url: "https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78",
    native_currency: {
      symbol: "Matic",
      name: "Matic",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  },
  {
    name: "Avalanche Mainnet",
    short_name: "avax",
    chain: "smartchain",
    network: "mainnet",
    chain_id: 43114,
    network_id: 43114,
    rpc_url: "	https://api.avax.network/ext/bc/C/rpc",
    native_currency: {
      symbol: "AVAX",
      name: "AVAX",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  },
  {
    name: "Avax - Testnet",
    short_name: "avax",
    chain: "smartchain",
    network: "testnet",
    chain_id: 43113,
    network_id: 43113,
    rpc_url: "https://api.avax-test.network/ext/bc/C/rpc",
    native_currency: {
      symbol: "AVAX",
      name: "AVAX",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  },
];

export default supportedChains;