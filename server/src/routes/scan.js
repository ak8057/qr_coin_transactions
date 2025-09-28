const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const parseQr = require("../utils/parseQr");
const { getCoinsForItem } = require("../utils/coinMap");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const mongoose = require("mongoose");

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = data.id;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * POST /api/scan
 * body: { qrText: "ITEM:...|GREENCOIN:...|TXN:..." }
 */
router.post("/scan", authMiddleware, async (req, res) => {
  try {
    const { qrText } = req.body;
    if (!qrText) return res.status(400).json({ error: "qrText required" });

    const parsed = parseQr(qrText);
    const TXN = parsed.TXN;
    const ITEM = parsed.ITEM;

    if (!TXN || !ITEM)
      return res.status(400).json({ error: "QR missing TXN or ITEM" });

    // check if TXN already consumed
    const existing = await Transaction.findOne({ txId: TXN });
    if (existing) return res.status(400).json({ error: "TXN already used" });

    // compute coins
    const coinsFromMap = getCoinsForItem(ITEM);
    const coins = coinsFromMap || Number(parsed.GREENCOIN || 0);

    if (!coins || coins <= 0)
      return res.status(400).json({ error: "Unrecognized ITEM or 0 coins" });

    // Atomic wallet update + tx
    // const session = await mongoose.startSession();
    // session.startTransaction();
    try {
      // remove session handling
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      let wallet = await Wallet.findOne({ user: user._id });
      if (!wallet) wallet = new Wallet({ user: user._id, balance: 0 });

      wallet.balance += coins;
      await wallet.save();

      const tx = new Transaction({
        txId: TXN,
        user: user._id,
        item: ITEM,
        coins,
        machinePayload: parsed,
      });
      await tx.save();

      return res.json({
        ok: true,
        newBalance: wallet.balance,
        txId: TXN,
        coinsCredited: coins,
      });

      // const user = await User.findById(req.userId).session(session);
      // if (!user) {
      //   await session.abortTransaction();
      //   session.endSession();
      //   return res.status(404).json({ error: "User not found" });
      // }

      // let wallet = await Wallet.findOne({ user: user._id }).session(session);
      // if (!wallet) {
      //   wallet = new Wallet({ user: user._id, balance: 0 });
      // }

      // wallet.balance += coins;
      // await wallet.save({ session });

      // const tx = new Transaction({
      //   txId: TXN,
      //   user: user._id,
      //   item: ITEM,
      //   coins,
      //   machinePayload: parsed,
      // });
      // await tx.save({ session });

      // await session.commitTransaction();
      // session.endSession();

      // return res.json({
      //   ok: true,
      //   newBalance: wallet.balance,
      //   txId: TXN,
      //   coinsCredited: coins,
      // });
    } catch (err) {
      // await session.abortTransaction();
      // session.endSession();
      throw err;
    }
  } catch (err) {
    console.error("Scan error:", err);
    return res.status(500).json({ error: "server error" });
  }
});



module.exports = router;
