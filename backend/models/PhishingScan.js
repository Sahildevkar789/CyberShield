const mongoose = require("mongoose");

const phishingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  url: String,
  prediction: String,
  confidence: Number
}, { timestamps: true });

module.exports = mongoose.model("PhishingScan", phishingSchema);
