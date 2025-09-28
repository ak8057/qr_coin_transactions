const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email & password required" });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Already registered" });
    const user = await User.createWithPassword(email, password);
    await Wallet.create({ user: user._id, balance: 0 });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.json({ token, email: user.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});


router.get("/wallet", authMiddleware, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.userId });
    return res.json({ balance: wallet?.balance ?? 0 });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const u = await User.findOne({ email });
  if (!u) return res.status(400).json({ error: "Invalid credentials" });
  const ok = await u.comparePassword(password);
  if (!ok) return res.status(400).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: u._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return res.json({ token, email: u.email });
});

module.exports = router;
