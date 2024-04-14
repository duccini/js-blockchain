function Blockchain() {
  this.chain = []; // chain of blocks
  this.newTransactions = []; // hold all of new transactions before put in a block
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
    transactions: this.newTransactions, // pending transactions
    nonce: nonce, // number, proof that we created this block with proof of work
    hash: hash, // hash of the block's data
    previousBlockHash: previousBlockHash,
  };

  this.newTransactions = [];
  this.chain.push(newBlock);

  return newBlock;
};
