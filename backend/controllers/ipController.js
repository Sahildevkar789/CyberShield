const axios = require("axios");

exports.checkIPReputation = async (req, res) => {
  try {
    const { ip } = req.body;

    if (!ip) {
      return res.status(400).json({ message: "IP address is required" });
    }

    const apiKey = (process.env.ABUSEIPDB_KEY || process.env.ABUSEIPDB_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(503).json({
        message: "AbuseIPDB API key not configured. Add ABUSEIPDB_KEY to .env"
      });
    }

    const response = await axios.get(
      "https://api.abuseipdb.com/api/v2/check",
      {
        headers: {
          Key: apiKey,
          Accept: "application/json"
        },
        params: {
          ipAddress: ip,
          maxAgeInDays: 90
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error("IP Reputation Error:", error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ message: "IP not found in database" });
    }
    res.status(500).json({ message: "IP lookup failed" });
  }
};
