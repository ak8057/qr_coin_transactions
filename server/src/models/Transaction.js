const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  txId: { type: String, unique: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  item: String,
  coins: Number,
  machinePayload: Object, // store raw parsed QR
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
