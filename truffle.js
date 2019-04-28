var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "they pulp arctic fringe tide bar garment wisdom industry label across silent";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:9545/", 0, 50);
      },
      network_id: '*',
      gas: 999999
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};
