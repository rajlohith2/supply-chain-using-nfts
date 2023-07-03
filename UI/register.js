import * as constants from "./constants.js";
const provider = new Web3.providers.HttpProvider("http://localhost:7545");
const web3 = new Web3(provider);
let supplyChainContract;
fetch("../build/contracts/SupplyChain.json")
  .then((response) => response.json())
  .then((data) => {
    // Store the JSON data in a variable
    supplyChainContract = new web3.eth.Contract(data.abi, contractAddress);
  })
  .catch((error) => {
    console.log("Failed to load JSON file");
  });
// Set the contract address and ABI (Application Binary Interface)
const contractAddress = constants.CONTRACT_ADDRESS; // replace with the address of your deployed contract

document
  .getElementById("register-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // prevent the default form submission
    let address = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let userType = document.getElementById("user-type").value;
    let name = document.getElementById("company").value;
    supplyChainContract.methods
      .createUser(address, name, password, userType)
      .send(
        {
          from: address,
          gas: 5000000,
        },
        (error, result) => {
          if (error) {
            console.log(error);
          } else {
            if (result) {
              alert("User registered successfully!");
              window.location.href = "index.html";
            } else {
              alert("Error occured while registering user!");
            }
          }
        }
      );
  });
