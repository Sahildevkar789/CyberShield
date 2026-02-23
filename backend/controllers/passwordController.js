const axios = require("axios");
const PasswordScan = require("../models/PasswordScan");

exports.checkPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

   if (!process.env.PASSWORD_CHECKER_URL) {
  throw new Error("PASSWORD_CHECKER_URL not configured");
}
console.log("Calling:", `${process.env.PASSWORD_CHECKER_URL}/check`);
const response = await axios.post(
  `${process.env.PASSWORD_CHECKER_URL}/check`,
  { password },
  { timeout: 15000 }
);

    const result = response.data;

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    const scan = await PasswordScan.create({
      user: req.user._id,
      entropy: result.entropy,
      strength: result.strength,
      difficulty: result.difficulty,
      crack_time_estimate: result.crack_time_estimate,
      suggestions: result.suggestions || []
    });

    res.json({
      ...scan.toObject(),
      recommended_password: result.recommended_password
    });

  } catch (error) {
    console.error("Password Check Error:", error.message);
    res.status(500).json({ message: "Password check failed" });
  }
};
