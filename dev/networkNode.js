const express = require("express");
const uuid = require("uuid");

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
});

// Register a Node
app.post("/register-node", (req, res) => {
  res.end();
});

// Register Multiple Nodes at Once
app.post("/register-nodes-bulk", (req, res) => {});

// const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
