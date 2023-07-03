const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const ipfsClient = require("ipfs-http-client");
const projectId = "2PicqfQaerxlrsHkc8qOqDHSXlg";
const projectSecret = "02d866576ad7fe9e109dfceab9cc1aea";
const auth1 =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = ipfsClient.create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth1,
  },
});

app.post("/upload-nft-image", (req, res) => {
  // Get metadata and image buffer from the request body
  const metadata = req.body.metadata;
  const imageBuffer = req.body.image;
  client.add(imageBuffer).then((response1) => {
    metadata.imageURI = response1.path;
    const nftJSON = JSON.stringify(metadata);
    client.add(nftJSON).then((response2) => {
      res.send(response2);
    });
  });
});

app.post("/get-nft", (req, response) => {
  // Get metadata and image buffer from the request body
  const id = req.body.nftId;
  const options = {
    url: "https://ipfs.infura.io:5001/api/v0/cat?arg=" + id,
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(projectId + ":" + projectSecret).toString("base64"),
    },
  };
  request(options, function (err, res, body) {
    if (err) {
      console.error(err);
    } else {
      options.url =
        "https://ipfs.infura.io:5001/api/v0/cat?arg=" +
        JSON.parse(body).imageURI;
      request(options, function (err, res, body) {
        if (err) {
          console.error(err);
        } else {
          data = JSON.stringify({ image: body });
          response.send(data);
        }
      });
    }
  });
});

app.get("/mycoolapp/test/", function (req, res) {
  res.send("Hello from the 'test' URL");
});
// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
