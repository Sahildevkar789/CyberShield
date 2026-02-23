const axios = require("axios");
const PhishingScan = require("../models/PhishingScan");

exports.checkPhishing = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL required" });
    }

    // LOCAL DEVELOPMENT URL
    if (!process.env.PHISHING_MODEL_URL) {
  throw new Error("PHISHING_MODEL_URL not configured");
}

const response = await axios.post(
  `${process.env.PHISHING_MODEL_URL}/predict`,
  { url },
  { timeout: 20000 }
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
