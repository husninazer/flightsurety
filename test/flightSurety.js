
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545/'));

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirlines() if it is not funded', async () => {

    // ARRANGE
    let newAirline = accounts[1];

    // ACT
    try {
        await config.flightSuretyApp.registerAirlines(newAirline, "Sample Airlines",  {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline);

    // ASSERT
    assert.equal(result, false, "Cannot register");

  });

  it('Airline can be registered, but does not participate in contract until it submits funding of 10 ether', async () => {

   // ARRANGE
    let newAirline = accounts[2];
    let newAirline2 = accounts[3];

   // ACT
   try {
       await config.flightSuretyApp.airlineFund( {from: newAirline, value: web3.utils.toWei("10","ether") });
   }
   catch(e) {
       console.log("error",e)
   }
   try {
       await config.flightSuretyApp.registerAirlines(newAirline2 , "Sample Airlines", {from: newAirline});
   }
   catch(e) {
       console.log("error",e)
   }
   let result = await config.flightSuretyData.isAirline.call(newAirline2);

   // ASSERT
   assert.equal(result, true, "Can Register");

 });



  it('Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines ', async () => {
    // ARRANGE

     let airline1 = accounts[4];
     let airline2 = accounts[5];
     let airline3 = accounts[6];
     let airline4 = accounts[7];
     let airline5 = accounts[8];
     let airline6 = accounts[9];

     try {

         await config.flightSuretyApp.registerAirlines(airline1 , "Sample Airlines", {from: config.owner});

         await config.flightSuretyApp.registerAirlines(airline2 , "Sample Airlines", {from: config.owner});

         await config.flightSuretyApp.registerAirlines(airline3 , "Sample Airlines", {from: config.owner});

      //   await config.flightSuretyApp.registerAirlines(airline4 , "Sample Airlines", {from: config.owner});

     }
     catch(e) {
         console.log(e)
     }

     // ACT
    try {

        await config.flightSuretyApp.airlineFund( {from: airline1, value: web3.utils.toWei("10","ether") });


        await config.flightSuretyApp.airlineFund( {from: airline2, value: web3.utils.toWei("10","ether") });

        await config.flightSuretyApp.airlineFund( {from: airline3, value: web3.utils.toWei("10","ether") });


    //    await config.flightSuretyApp.airlineFund( {from: airline4, value: web3.utils.toWei("10","ether") });

    }
    catch(e) {
        console.log(e)
    }



    try {
      await config.flightSuretyApp.registerAirlines(airline5 , "Sample Airlines", {from: config.owner});
      await config.flightSuretyApp.registerAirlines(airline5 , "Sample Airlines", {from: airline1});

      await config.flightSuretyApp.registerAirlines(airline6 , "Sample Airlines", {from: config.owner});
      await config.flightSuretyApp.registerAirlines(airline6 , "Sample Airlines", {from: airline1});
    
     }
    catch(e) {
        console.log(e)
    }
    let result = await config.flightSuretyData.isAirline.call(airline5);
    let result2 = await config.flightSuretyData.isAirline.call(airline6);


    // ASSERT
    assert.equal(result && result2 , true, "Voting");

  })



});
