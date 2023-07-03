import * as constants from "./constants.js";
const provider = new Web3.providers.HttpProvider("http://localhost:7545");
const web3 = new Web3(provider);
let supplyChainContract;
const contractAddress = constants.CONTRACT_ADDRESS;
let allProductDetails = [];
const productDetails = [
  "Product ID",
  "Product Name",
  "Origin",
  "Production Date",
  "Supplier",
  "Manufacturer",
  "Distributor",
  "Pharmacy",
  "Consumer",
  "NFT ID",
  "Raw Materials Used",
  "Certification",
  "Description",
];

const pipelineStages = [
  "supplier",
  "manufacturer",
  "distributor",
  "pharmacist",
  "consumer",
];

const userType = JSON.parse(
  localStorage.getItem("userData")
).userType.toString();

const userAddress = JSON.parse(
  localStorage.getItem("userData")
).address.toString();

if (userType == "manufacturer") {
  document.getElementById("create-btn").style.display = "inline";
}
// replace with the address of your deployed contract
fetch("../build/contracts/SupplyChain.json")
  .then((response) => response.json())
  .then((data) => {
    // Store the JSON data in a variable
    supplyChainContract = new web3.eth.Contract(data.abi, contractAddress);
    // Set the contract address and ABI (Application Binary Interface)
    const medicinesList = document.getElementById("medicines-list");

    supplyChainContract.methods.getProductsOfUser(userAddress).call(
      {
        from: userAddress,
        gas: 5000000,
      },
      (error, result) => {
        if (error) {
          document.getElementById("medicines-list").innerHTML =
            "No products to display!";
          console.log(error);
        } else {
          result = result.substring(0, result.length - 1);
          const items = result.split(",").map((item) => {
            const [index, value] = item.split(":");
            return { index, value };
          });
          items.forEach((item) => {
            const listItem = document.createElement("li");
            const card = document.createElement("div");
            card.classList.add("card");
            const heading = document.createElement("h2");
            heading.textContent = item.value;
            const paragraph = document.createElement("p");
            paragraph.textContent = `Product ID: ${item.index}`;
            card.appendChild(heading);
            card.appendChild(paragraph);
            listItem.appendChild(card);
            medicinesList.appendChild(listItem);
            supplyChainContract.methods.getProductDetails(item.index).call(
              {
                from: userAddress,
                gas: 5000000,
              },
              (error, result) => {
                if (error) {
                  console.log(error);
                } else {
                  allProductDetails.push(Array.from(result.slice(0, 15)));
                }
              }
            );
            listItem.addEventListener("click", () => {
              document.getElementById("progress-info").innerHTML =
                "Click on a stage for more details";
              getProductDetails(item.index);
            });
          });
        }
      }
    );
  });
const getProductDetails = (tokenId) => {
  let oldTable = document.getElementById("med-details"); // Replace "myTable" with the ID of your table
  let rowCount = oldTable.rows.length;

  for (let i = rowCount - 1; i >= 0; i--) {
    oldTable.deleteRow(i);
  }
  document.getElementById("med-name").innerHTML =
    allProductDetails[tokenId][1] + ":" + tokenId;
  let myDiv = document.getElementById("medicine-details");
  myDiv.style.display = "block";
  document.getElementById("message").style.display = "none";
  const table = document.getElementById("med-details");
  localStorage.setItem(
    "currentProduct",
    JSON.stringify({ data: allProductDetails[tokenId] })
  );
  for (let i = 0; i < 13; i++) {
    const row = table.insertRow();
    const key = productDetails[i];
    const cell1 = row.insertCell();
    const cell2 = row.insertCell();
    cell1.innerHTML = `<b>${key}</b>`;
    cell2.innerHTML = allProductDetails[tokenId][i];
    row.appendChild(cell1);
    row.appendChild(cell2);
  }

  for (let i = 0; i < pipelineStages.length; i++) {
    let stage = document.getElementById(pipelineStages[i]);
    let stageCircle = document.getElementById(pipelineStages[i] + "-circle");
    if (i < pipelineStages.indexOf(userType)) {
      stage.classList.add("old");
      stageCircle.classList.add("old");
    }
    if (i == pipelineStages.indexOf(userType)) {
      stage.classList.add("active");
      stageCircle.classList.add("active");
    } else {
      stage.classList.add("future");
      stageCircle.classList.add("future");
    }
  }

  fetch("http://localhost:3000/get-nft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nftId: allProductDetails[tokenId][9],
    }),
  }).then((response) => {
    response.json().then((data) => {
      document.getElementById("nft").src = data.image;
    });
  });
};

// Handling Create Product Modal
var modal = document.getElementById("myModal");
var btn = document.getElementById("create-btn");
var createClose = document.getElementById("create-close");
btn.onclick = function () {
  modal.style.display = "block";
};
createClose.onclick = function () {
  modal.style.display = "none";
};
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

//Handling Update Modal
var updateBtn = document.querySelector("#updateBtn");
var updateModal = document.getElementById("updateModal");
var updateClose = document.getElementById("update-close");
updateBtn.onclick = function () {
  updateModal.style.display = "block";
};
updateClose.onclick = function () {
  updateModal.style.display = "none";
};
window.onclick = function (event) {
  if (event.target == updateModal) {
    updateModal.style.display = "none";
  }
};

//Handling Transfer Modal
const transferBtn = document.getElementById("btn2");
const transferModal = document.getElementById("myModal2");
const transferClose = document.getElementById("transfer-close");
transferBtn.onclick = function () {
  transferModal.style.display = "block";
};
transferClose.onclick = function () {
  transferModal.style.display = "none";
};
window.onclick = function (event) {
  if (event.target == transferModal) {
    transferModal.style.display = "none";
  }
};

const currentUserType = JSON.parse(localStorage.getItem("userData")).userType;
pipelineStages.forEach((stage, idx) => {
  document.getElementById(stage).addEventListener("click", () => {
    let currentProduct = JSON.parse(
      localStorage.getItem("currentProduct")
    ).data;
    supplyChainContract.methods
      .getParameterDetails(currentProduct[0], currentUserType)
      .call(
        {
          from: userAddress,
          gas: 5000000,
        },
        (error, result1) => {
          if (error) {
            document.getElementById("progress-info").innerHTML =
              "No Info Available";
            console.log(error);
          } else {
            supplyChainContract.methods
              .getUserDetails(currentProduct[idx + 4])
              .call(
                {
                  from: userAddress,
                  gas: 5000000,
                },
                (error, result2) => {
                  if (error) {
                    document.getElementById("progress-info").innerHTML =
                      "No Info Available";
                    console.log(error);
                  } else {
                    if (result2[0].startWith("0x00000000")) {
                      document.getElementById("progress-info").innerHTML =
                        "Information Not Recorded";
                    } else {
                      document.getElementById("progress-info").innerHTML = `
                      <p>Company Name: ${result2[1]}</p>
                      <p>ETH Address: ${result2[0]}</p>
                      <p>Location: ${result1[1]}</p>
                      <p>Timestamp: ${new Date(result1[2])}</p>
                      <p>Temperature: ${result1[3]} &#8451;</p>
                      <p>Humidity: ${result1[4]}%</p>
                    `;
                    }
                  }
                }
              );
          }
        }
      );
  });
});

const createForm = document.querySelector("#create");
createForm.addEventListener("submit", (e) => {
  e.preventDefault(); // prevent the form from submitting
  const formData = new FormData(createForm);
  const json = {};
  Array.from(formData.entries()).forEach(([key, value]) => {
    json[key] = value;
  });
  const element = document.getElementById("nft-image-input");
  var file = element.files[0];
  var reader = new FileReader();
  reader.onloadend = function () {
    console.log("RESULT", reader.result);
    fetch("http://localhost:3000/upload-nft-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: reader.result,
        metadata: json,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        supplyChainContract.methods
          .createProduct(
            formData.get("itemName"),
            formData.get("origin"),
            new Date().getTime(),
            formData.get("rawMaterialInfo"),
            formData.get("certifications"),
            formData.get("productDescription"),
            formData.get("manufacturingLocation"),
            formData.get("recordedTemperature"),
            formData.get("recordedHumidity"),
            new Date().getTime(),
            formData.get("supplierAddress"),
            data.path
          )
          .send(
            {
              from: userAddress,
              gas: 5000000,
            },
            (error, result) => {
              if (error) {
                console.log(error);
              } else {
                alert("Product Created Successfully");
                location.reload();
                console.log(result);
              }
            }
          );
      })
      .catch((error) => console.error(error));
  };
  reader.readAsDataURL(file);
});

const paramsForm = document.querySelector("#params");
paramsForm.addEventListener("submit", (e) => {
  e.preventDefault(); // prevent the form from submitting
  let currentProduct = JSON.parse(localStorage.getItem("currentProduct")).data;
  const formData = new FormData(paramsForm);
  supplyChainContract.methods
    .updateProductParameters(
      currentProduct[0],
      formData.get("recorded-location"),
      new Date().getTime(),
      formData.get("recorded-temperature"),
      formData.get("recorded-humidity"),
      userType
    )
    .send(
      {
        from: userAddress,
        gas: 5000000,
      },
      (error, result) => {
        if (error) {
          alert("Error Occured! Please try again");
          console.log(error);
        } else {
          alert("Product Parameters Updated Successfully");
          location.reload();
        }
      }
    );
});

const transferForm = document.querySelector("#transfer");
transferForm.addEventListener("submit", (e) => {
  e.preventDefault(); // prevent the form from submitting

  let currentProduct = JSON.parse(localStorage.getItem("currentProduct")).data;
  const formData = new FormData(transferForm);
  const recipientAddress = formData.get("recipient-eth-address");
  const transactionAmount = formData.get("transaction-amount");
  supplyChainContract.methods
    .transferProductOwnership(
      currentProduct[0],
      formData.get("recipient-eth-address")
    )
    .send(
      {
        from: userAddress,
        gas: 5000000,
      },
      (error, result) => {
        if (error) {
          alert("Error Occured! Please try again");
          console.log(error);
        } else {
          web3.eth.sendTransaction({
            from: recipientAddress,
            to: userAddress,
            value: web3.utils.toWei(transactionAmount, "ether"),
          });
          alert("Transfer Successful");
          location.reload();
        }
      }
    );
});

document.getElementById("logout").addEventListener("click", () => {
  localStorage.clear();
  location.href = "./index.html";
});
