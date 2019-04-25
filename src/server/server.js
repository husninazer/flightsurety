import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let contractOwner = web3.eth.accounts[0];

let oracles = registerOracles();



// Events
flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, async function (error, event) {
    if (error) console.log(error)
    console.log(event)


    let index = event.returnValues.index;
    let airline = event.returnValues.airline;
    let flight = event.returnValues.flight;
    let timestamp = event.returnValues.timestamp;
    let statusCode = Math.floor(Math.random()*6)*10; // Status codes - 10, 20, 30, 40. 50

    //Loop through each oracles to find the index received.
    for(let i=0; i<oracles.length; i++) {
      if(oracle[i].indexes.include(indexReceived))
      await flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, statusCode).send({from: oracle[i].oracle})
    }
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})


//Utility Functions
async function registerOracles(){
  let oracles = []
  let accounts = await web3.eth.getAccounts();

  for(let i=5; i<10; i++) {
    let registration = await flightSuretyApp.methods.registerOracle().send({from: accounts[i], value: web3.utils.toWei("1", "ether"), gas: 3000000});
  //  console.log("REGISTRATION", registration);

    let indexes = await flightSuretyApp.methods.getMyIndexes().call({from: accounts[i]})
  //  console.log("INDEXES", indexes);

    oracles.push({oracle: accounts[i], indexes: indexes});
  }

//  console.log("ORACLES", oracles);
  return oracles;
}

export default app;
