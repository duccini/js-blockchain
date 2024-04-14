const Blockchain = require("./blockchain");

const maua = new Blockchain();

// maua.createNewBlock(1000, "djhdhdhjd", "aqw5tbcx8");
// maua.createNewBlock(4545, "ewwsaqqq", "resdfghjjs");
// maua.createNewBlock(7669, "loi8yygg", "frewsssj");

// maua.createNewBlock(120000, "akjakjkdjd", "denendedqw");

// maua.createNewTransaction(10, "0x9999ALEX", "0x1111JENNA");
// maua.createNewTransaction(20, "0x9999DANI", "0x1111JENNA");
// maua.createNewTransaction(30, "0x9999ALEX", "0x1111ANA");

// maua.createNewBlock(120001, "DEDEDEDF", "WEWEEE");

// maua.createNewTransaction(30, "0x9999ALEX", "0x1111ANA");

const previousBlockHash = "SJSHDJHJHDJASJHAJSHJAHSJHAJSHJSHSJHJSHJSH";
const currentBlockData = [
  {
    amount: 10,
    sender: "0x9999ALEX",
    recipient: "0x1111JENNA",
  },
  {
    amount: 20,
    sender: "0x9999DANI",
    recipient: "0x1111JENNA",
  },
  {
    amount: 310,
    sender: "0x9999ALEX",
    recipient: "0x1111ANA",
  },
];

const nonce = 100;

const hash = maua.hashBlock(previousBlockHash, currentBlockData, nonce);

console.log(hash);
