const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  url: String,
  status_code: Number,
  https: Boolean,
  ssl_valid: Boolean,
  headers: Object,
  risk_level: String,
  risk_score: Number,
  missing_headers: [String],
  server: String,
  technology: String,
  ssl_expiry: String,
  redirect_chain: Array
}, { timestamps: true });

module.exports = mongoose.model("Scan", scanSchema);
