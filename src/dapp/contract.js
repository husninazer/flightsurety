import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress)
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {

            this.owner = accts[0];

            let counter = 1;

            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        }
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    addAirline(airlineAddress, airlineName, callback) {
        let self = this;
        let payload = {
            airlineAddress: airlineAddress,
            airlineName: airlineName
        }
        self.flightSuretyApp.methods
            .registerAirlines(payload.airlineAddress, payload.airlineName)
            .send({ from: self.owner, gas:3000000}, (error, result) => {
                callback(error, result);
            });
    }

    getRegisteredAirlines(callback) {
        let self = this;
        self.flightSuretyData.methods.getAirlinesRegistered().call({ from: self.owner}, function(err, result){
         if(!err)
             console.log(result)
             callback(result)
       });
    }


    addFlight(flightNumber, airlineAddress, callback) {
        let self = this;
        let payload = {
            flightNumber: flightNumber,
            airlineAddress: airlineAddress
        }
        self.flightSuretyApp.methods
            .registerFlight(payload.flightNumber, payload.airlineAddress)
            .send({ from: self.owner, gas:3000000}, (error, result) => {
                callback(error, result);
            });
    }

    getRegisteredFlights(callback) {
        let self = this;
        self.flightSuretyData.methods
        .getFlightsRegistered().call({from: self.owner}, function(err, result){
         if(!err)
             console.log(result)
             callback(result)
       });
    }


    purchaseInsurance(flightNumber, callback) {
        let self = this;
        self.flightSuretyApp.methods
        .buyInsurance(flightNumber).send({from: self.owner}, function(err, result){ // value: this.web3.utils.toWei(1, "ether"
         if(!err)
             console.log(result)
         else console.log(err)
        //console.log(web3.fromWei(web3.eth.getBalance(self.owner),"ether").toString())
             callback(err, result)
       });
    }


    // Check Balance
    getBalance(callback) {
        let self = this;
        self.flightSuretyApp.methods
        .balance().call({from: self.owner}, function(err, result){
         if(!err)
             console.log(result)
             callback(result)
       });
    }

    //Claim insurance
    sendClaim(callback) {
        let self = this;
        self.flightSuretyApp.methods
        .claim().send({from: self.owner,  gas:3000000}, function(err, result){
         if(!err)
             console.log(result)
             callback(result)
       });
    }




}
