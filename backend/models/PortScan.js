const mongoose = require("mongoose");

const portScanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  host: String,
  open_ports: [{
    port: Number,
    description: String
  }],
  total_open: Number,
  risk_level: String
}, { timestamps: true });

module.exports = mongoose.model("PortScan", portScanSchema);
