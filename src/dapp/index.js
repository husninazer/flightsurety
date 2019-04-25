
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        populate(contract);


        // Add Airline Submission
        DOM.elid('submit-airline-add').addEventListener('click', () => {
            let airlineAddress = DOM.elid('airline-address').value;
            let airlineName = DOM.elid('airline-name').value;

            if(airlineAddress == '') return alert("Airline Account Mandatory")
            if(airlineName == '') return alert("Airline Name Mandatory")

            // Write transaction
            contract.addAirline(airlineAddress, airlineName, (error, result) => {
                error? console.log(error):console.log(result);
                display('Airlines', 'Adding Airline', [ { label: 'Airline Register Status', error: error, value: result + ' ' + result.votes} ]);
                populate(contract);
            });
        })

        // Add Flight Submission
        DOM.elid('submit-flight-add').addEventListener('click', () => {
            let el = DOM.elid('airlines-selection');
            let airlineAddress = el.options[el.selectedIndex].value;
            let flightNumber = DOM.elid('txt-flight-number').value;

            if(airlineAddress == '') return alert("Airline Account Mandatory")
            if(flightNumber == '') return alert("Flight Number Mandatory")

            console.log(airlineAddress + ' ' + flightNumber);

            // Write transaction
            contract.addFlight(flightNumber, airlineAddress, (error, result) => {
                error? console.log(error):console.log(result);
                display('Flights', 'Adding new flight', [ { label: 'Flight Register Status', error: error, value: result } ]);
                // contract.getRegisteredAirlines((result) => {
                //
                // });

                populate(contract);
            });
        })


        // Purchase Insurance for Passenger
        DOM.elid('submit-flight-insurance').addEventListener('click', () => {
            let el = DOM.elid('flights-selection');
            let flightNumber = el.options[el.selectedIndex].value;

            if(flightNumber == '') return alert("Flight Number Mandatory")

            // Write transaction
            contract.purchaseInsurance(flightNumber, (error, result) => {
                error? console.log(error):console.log(result);
                display('Insurance', 'Purchase new Insurance', [ { label: 'Insurance Status', error: error, value: result } ]);
            });
        })


        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let el = DOM.elid('flight-number');
            let flight = el.options[el.selectedIndex].value;

            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        // User-check balance transaction
        DOM.elid('submit-check-balance').addEventListener('click', () => {
            // Write transaction
            contract.getBalance((error, result) => {
                //Display on screen
                let head = DOM.elid('head-balance');
                head.innerHTML = 'Credit Balance: ' +  result +' ether';
            });
        })

        // User-check balance transaction
        DOM.elid('submit-claim-insurance').addEventListener('click', () => {
            // Write transaction
            contract.sendClaim((error, result) => {
                console.log(error,  result);
            });
        })

    });


})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.innerHTML = "";
    displayDiv.append(section);

}


function populate(contract) {
  contract.getRegisteredAirlines((result) => {
      let select = DOM.elid("airlines-selection");
      select.innerHTML = '<option disabled selected>Select an Airline</option>';
      var option;

      for (let i =0; i< result.length; i++) {
        option = document.createElement("option");
        option.text = result[i];
        option.value = result[i];
        select.appendChild(option);
      }
  });

  // Get all the flights avaialble for insurance purchase
  contract.getRegisteredFlights((result) => {
    let select1 = DOM.elid("flights-selection");
    let select2 = DOM.elid("flight-number");
    select1.innerHTML = '<option disabled selected>Select a Flight</option>';
    select2.innerHTML = '<option disabled selected>Select a Flight</option>';
    let option1;
    let option2;

    for (let i =0; i< result.length; i++) {
      option1 = document.createElement("option");
      option1.text = result[i];
      option1.value = result[i];

      option2 = document.createElement("option");
      option2.text = result[i];
      option2.value = result[i];

      select1.appendChild(option1);
      select2.appendChild(option2);
    }
  })
}
