const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const scanRoutes = require("./routes/scan");
// const machineRoutes = require("./routes/machine"); 

const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api", scanRoutes);
// app.use("/api/machine", machineRoutes); 

module.exports = app;
