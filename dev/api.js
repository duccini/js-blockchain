const express = require("express");
const Blockchain = require("./blockchain");

// Initiate our Blockchain
const maua = new Blockchain();

const app = express();
app.use(express.json());

// Get Blockchain
app.get("/blockchain", (req, res) => {
  res.json(maua);
});

// Create a Transactions
app.post("/transactions", (req, res) => {
  const { sender, recipient, amount } = req.body;

  const blockIndex = maua.createNewTransaction(sender, recipient, amount);

  res.json({ blockIndex });
});

// Create a Block
app.get("/mine", (req, res) => {});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
