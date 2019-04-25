pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    struct Airline {
      address airlineAddress;
      string airlineName;
      bool funded;
    }

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
        uint32 flightNumber;
        address[] passengers; // 20 Seats per flight
    }

    struct PassengerProfile {
      uint32 balance;
    }


    address[] public airlinesRegistered;
    mapping(address => Airline) public airlines;

    uint32[] public flightsRegistered;
    mapping(uint32 => Flight) flights;

    mapping(address => PassengerProfile) passengers;
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                )
                                public
    {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    // modifier requireIsOperational()
    // {
    //     require(isOperational(), "Contract is currently not operational");
    //     _;  // All modifiers require an "_" which indicates where the function body will be added
    // }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    //Modifier for checking an airline has funded or Not
    modifier requireAirlineFunded(address _airlineAddress) {
      require(airlines[_airlineAddress].funded == true , "Airline is not Funded");
      _;
    }



    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational()
                            view
                            external
                            returns(bool)
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus
                            (
                                bool mode
                            )
                            external
                            requireContractOwner
    {
        operational = mode;
    }



    //Return Registered airlinesRegistered
    function getAirlinesRegistered
                              (
                              )
                              public
                              view
                              returns(address[])

    {
      return airlinesRegistered;
    }

    //Return Registered flights
    function getFlightsRegistered
                              (
                              )
                              public
                              view
                              returns(uint32[])

    {
      return flightsRegistered;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline
                            (
                              address _airlineAddress,
                              string _airlineName,
                              bool _funded
                            )
                            external

    {
        //Check for unique
        bool unique = true;
        for(uint i=0; i<airlinesRegistered.length; i++) {
          if(airlinesRegistered[i] == _airlineAddress) unique = false;
        }
        require(unique, "Airline already Added");

        airlinesRegistered.push(_airlineAddress);
        airlines[_airlineAddress] = Airline ({
        airlineAddress: _airlineAddress,
        airlineName: _airlineName,
        funded: _funded
      });
    }

    /**
     * @dev Register a future flight for insuring.
     *
     */
     function registerFlight
                                 (
                                   uint32 _flightNumber,
                                   address _airlineAddress
                                 )
                                 external

     {
       flightsRegistered.push(_flightNumber);

       flights[_flightNumber] =  Flight({
          isRegistered: true,
          statusCode: 0,
          updatedTimestamp: now,
          airline: _airlineAddress ,
          flightNumber: _flightNumber,
          passengers:  new address[](0)
       });
     }


   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy
                            (
                              uint32 _flightNumber,
                              address _passenger
                            )
                            external
    {

        //Check for unique
        bool unique = true;
        for(uint i=0; i<flights[_flightNumber].passengers.length; i++) {
          if(flights[_flightNumber].passengers[i] == _passenger) unique = false;
        }
        require(unique, "Insurance already purchased for this flight");

        flights[_flightNumber].passengers.push(_passenger); // Push the passenger address into insured list
        passengers[_passenger] = PassengerProfile({
          balance: 0
        });
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                  uint32 _flightNumber
                                )
                                external

    {
      for(uint i=0; i<flights[_flightNumber].passengers.length; i++) {
        passengers[flights[_flightNumber].passengers[i]].balance += 2;
      }
    }

    // Return the balance for the passenger
    function balance
                            (
                              address _passenger
                            )
                            external
                            returns (uint32 balance)

    {
        return passengers[_passenger].balance;
    }


    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    // Claim if balance availble
    function pay
                            (
                              address _passenger
                            )
                            external
                            returns (uint32)
    {
        // check if it is a valid passenger
      require(passengers[_passenger].balance > 0, "No balance in wallet");

      uint32 balance = passengers[_passenger].balance;

      return balance;

    }



   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund
                            (
                            )
                            public
                            payable
    {
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
                            external
                            payable
    {
        fund();
    }


}
