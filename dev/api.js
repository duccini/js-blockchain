const express = require("express");

const app = express();
app.use(express.json());

// Get Blockchain
app.get("/blockchain", (req, res) => {});

// Create a Transactions
app.post("/transactions", (req, res) => {
  const transactions = req.body.transactions;

  console.log(transactions);

  res.end();
});

// Create a Block
app.get("/mine", (req, res) => {});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
