const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// helper to set password
UserSchema.statics.createWithPassword = async function (email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const u = await this.create({ email, passwordHash });
  return u;
};

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", UserSchema);
