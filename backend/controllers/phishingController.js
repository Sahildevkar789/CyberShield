const axios = require("axios");
const PhishingScan = require("../models/PhishingScan");

exports.checkPhishing = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL required" });
    }

    // LOCAL DEVELOPMENT URL
    const response = await axios.post(
      "http://127.0.0.1:5004/predict",
      { url }
    );

    const result = response.data;

    const scan = await PhishingScan.create({
      user: req.user._id,
      url,
      prediction: result.prediction,
      confidence: result.confidence
    });

    res.json(scan);

  } catch (error) {
    console.error("Phishing Check Error:", error.message);
    res.status(500).json({ message: "Phishing check failed" });
  }
};