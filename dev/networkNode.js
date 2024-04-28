const express = require("express");
const uuid = require("uuid");

const rp = require("request-promise");

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

/**
 *   Create and Broadcast Node
 *
 *  This is the first stepe when we want to register a Node
 *  This endpoint will register the new Node to its own server and broadcast the new Node to
 *  the other Nodes
 */
app.post("/register-and-broadcast-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;

  // >> Register the New Node to the current Node
  if (maua.networkNodes.indexOf(newNodeUrl) == -1) {
    maua.networkNodes.push(newNodeUrl);
  }

  const registerNodesPromises = [];

  // >> Register new Node to each Node in maua.networkNodes
  maua.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl: newNodeUrl },
      json: true,
    };

    registerNodesPromises.push(rp(requestOptions));
  });

  // Run all these Promisses
  Promise.all(registerNodesPromises)
    .then((data) => {
      // >> Register all the current Network to the new Node
      const bulkRegisterOptions = {
        uri: newNodeUrl + "/register-nodes-bulk",
        method: "POST",
        body: { allNetworkNodes: [...maua.networkNodes, maua.currentNodeUrl] },
        json: true,
      };

      return rp(bulkRegisterOptions);
    })
    .then((data) => {
      res.json({ note: "New node registered with network successfully." });
    });
});

/**
 *  Register a Node with the Network
 *
 *  All the others Nodes will accept the new Node in this endpoint and regester it on their
 *  own servers
 */
app.post("/register-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;

  const nodeIsNotAlreadyPresent = maua.networkNodes.indexOf(newNodeUrl) == -1;
  const isNotCurrentNode = newNodeUrl !== maua.currentNodeUrl;

  if (nodeIsNotAlreadyPresent && isNotCurrentNode) {
    maua.networkNodes.push(newNodeUrl);
    res.json({
      note: `The new Node ${newNodeUrl} was successfully registered in ${maua.currentNodeUrl}`,
    });
  }
});

/**
 *  Register Multiple Nodes at Once
 *
 *  In this endpoint, the new Node register all Nodes of the Networt to its own server
 */
app.post("/register-nodes-bulk", (req, res) => {
  const allNetworkNodes = req.body.allNetworkNodes;

  // We need to loop throught the array to check if it already was registered
  allNetworkNodes.forEach((networkNodeUrl) => {
    const isNodeAlreadyPresent =
      maua.networkNodes.indexOf(networkNodeUrl) == -1;
    const isCurrentNode = maua.currentNodeUrl !== networkNodeUrl;

    if (isNodeAlreadyPresent && isCurrentNode) {
      maua.networkNodes.push(networkNodeUrl);
    }
  });

  res.json({
    note: `Bulk was successfully registered in ${maua.currentNodeUrl}`,
  });
});

// const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
