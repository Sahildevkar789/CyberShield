const axios = require("axios");

exports.searchCVE = async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({ message: "Search keyword is required" });
    }

    const response = await axios.get(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(keyword.trim())}`,
      { timeout: 15000 }
    );

    const vulnerabilities = (response.data.vulnerabilities || []).slice(0, 10);
    res.json(vulnerabilities);

  } catch (error) {
    console.error("CVE Search Error:", error.message);
    res.status(500).json({ message: "CVE search failed" });
  }
};
