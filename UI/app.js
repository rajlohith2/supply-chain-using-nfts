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

window.addEventListener(
  "DOMContentLoaded",
  () => {
    document
      .getElementById("login-form")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        let address = document.getElementById("username_login").value;
        let password = document.getElementById("password_login").value;
        let userType = document.getElementById("user-type_login").value;
        supplyChainContract.methods
          .verifyLogin(address, password, userType)
          .send(
            {
              from: address,
              gas: 5000000,
            },
            (error, result) => {
              if (error) {
                alert("Invalid Credentials");
              } else {
                alert("Login Successful");
                localStorage.setItem(
                  "userData",
                  JSON.stringify({ address: address, userType: userType })
                );
                window.location.href = "dashboard.html";
              }
            }
          );
      });
  },
  false
);
