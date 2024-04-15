const sha256 = require("sha256");

function Blockchain() {
  this.chain = []; // chain of blocks
  this.pendingTransactions = []; // hold all of new transactions before put in a block

  // Genesis Block
  this.createNewBlock(100, "0", "0");
}

// Create a New Block
Blockchain.prototype.createNewBlock = function (
  nonce,
  previousBlockHash,
  hash
) {
  const newBlock = {
    index: this.chain.length + 1, // block number
    timestamp: Date.now(),
    transactions: this.pendingTransactions, // pending transactions
    nonce: nonce, // number, proof that we created this block with proof of work
    hash: hash, // hash of the block's data
    previousBlockHash: previousBlockHash,
  };

  this.pendingTransactions = [];
  this.chain.push(newBlock);

  return newBlock;
};

// Get Last Block
Blockchain.prototype.getLastBlock = function () {
  return this.chain[this.chain.length - 1];
};

// Create a New Transaction
Blockchain.prototype.createNewTransaction = function (
  amount,
  sender,
  recipient
) {
  const newTransaction = {
    amount,
    sender,
    recipient,
  };

  this.pendingTransactions.push(newTransaction);

  // what block we will be able to find our new transactions in
  // getLastBlock()["index"]: `index` property of the block
  return this.getLastBlock()["index"] + 1;
};

// sha256 hashing function
Blockchain.prototype.hashBlock = function (
  previousBlockHash,
  currentBlockData,
  nonce
) {
  const dataAsString =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);

  const hash = sha256(dataAsString);

  return hash;
};

Blockchain.prototype.proofOfWork = function (
  previousBlockHash,
  currentBlockData
) {
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

  while (hash.substring(0, 4) !== "0000") {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }

  return nonce;
};

module.exports = Blockchain;
