const mongoose = require("mongoose");

const passwordScanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  entropy: Number,
  strength: String,
  difficulty: String,
  crack_time_estimate: String,
  suggestions: [String]
}, { timestamps: true });

module.exports = mongoose.model("PasswordScan", passwordScanSchema);
