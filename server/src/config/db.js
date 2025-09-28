const mongoose = require("mongoose");

async function connectDB(uri) {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Mongo connected");
}

module.exports = connectDB;
