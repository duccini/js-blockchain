const express = require("express");
const uuid = require("uuid");
const axios = require("axios");

const Blockchain = require("./blockchain");

// Make the server PORT variable
const PORT = process.argv[2];

// Initiate our Blockchain
const maua = new Blockchain();

const app = express();
app.use(express.json());

// Create Miner'address
const nodeAddress = uuid.v1().split("-").join("");

// Get Blockchain
app.get("/blockchain", (req, res) => {
  res.json(maua);
});

// Create a Transactions
app.post("/transactions", (req, res) => {
  const { amount, sender, recipient } = req.body;

  const blockIndex = maua.createNewTransaction(amount, sender, recipient);

  res.json({ blockIndex });
});

// Create a Block
app.get("/mine", (req, res) => {
  const lastBlock = maua.getLastBlock();
  const previousHash = lastBlock["hash"];

  const currentBlockData = {
    transactions: maua.pendingTransactions,
    index: lastBlock["index"] + 1,
  };

  const nonce = maua.proofOfWork(previousHash, currentBlockData);
  const currentHash = maua.hashBlock(previousHash, currentBlockData, nonce);

  // Rewarding the miner
  maua.createNewTransaction(12.5, "0x00", nodeAddress);

  const newBlock = maua.createNewBlock(nonce, previousHash, currentHash);

  res.json(newBlock);
});

// Create and Broadcast Node
app.post("/create-and-broadcast-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;

  // Register current Node to itself
  if (maua.networkNodes.indexOf(newNodeUrl) == -1)
    maua.networkNodes.push(newNodeUrl);

  // Promisses Array
  const regNodesPromises = [];

  // Broadcast new Node to all other Nodes
  maua.networkNodes.forEach((networkNodeUrl) => {
    const requestOption = {
      url: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl },
      json: true,
    };

    regNodesPromises.push(axios(requestOption));
  });

  Promise.all(regNodesPromises)
    .then((data) => {
      // the broadcast had happening, all the other nodes register this Node
      // now, we need register all the other Nodes in this one with Bulk endpoint
      const bulkRegisterOptions = {
        uri: newNodeUrl + "/register-nodes-bulk",
        method: "POST",
        body: { allNetworkNodes: [...maua.networkNodes, maua.currentNodeUrl] },
        json: true,
      };

      return axios(bulkRegisterOptions);
    })
    .then((data) => {
      res.json({ note: "New node registeres with network successfully." });
    });
});

// Register a Node
app.post("/register-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;

  const isNodeNotAdded = maua.networkNodes.indexOf(newNodeUrl) == -1;
  const isCurrentNode = newNodeUrl !== maua.currentNodeUrl;

  if (isNodeNotAdded && isCurrentNode) {
    maua.networkNodes.push(newNodeUrl);
    return res.json({ note: "New Node registered successfully." });
  } else {
    return res.status(404).json({ error: "Node already add to network" });
  }
});

// Register Multiple Nodes at Once
app.post("/register-nodes-bulk", (req, res) => {
  const allNetworkNodes = req.body.allNetworkNodes;

  allNetworkNodes.forEach((networkNodeUrl) => {
    const inNodeAlreadyPresent =
      maua.networkNodes.indexOf(networkNodeUrl) == -1;
    const isCurrentNode = maua.currentNodeUrl !== networkNodeUrl;

    if (inNodeAlreadyPresent && isCurrentNode) {
      maua.networkNodes.push(networkNodeUrl);
    }
  });

  res.json({ note: "Bulk registration successful." });
});

// const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
