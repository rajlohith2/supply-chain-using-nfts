module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
    },
  },
  compilers: {
    solc: {
      version: "0.8.1",
      settings: {
        optimizer: {
          enabled: true,
          runs: 50,
        },
      },
    },
  },
};
