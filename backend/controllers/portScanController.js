const axios = require("axios");
const PortScan = require("../models/PortScan");

const PORT_DESCRIPTIONS = {
  21: "FTP - File Transfer Protocol (Insecure)",
  22: "SSH - Secure Remote Access",
  25: "SMTP - Mail Transfer Service",
  53: "DNS - Domain Name Service",
  80: "HTTP - Web Traffic (Unencrypted)",
  443: "HTTPS - Secure Web Traffic",
  3306: "MySQL Database Service"
};

exports.scanPorts = async (req, res) => {
  try {
    const { host } = req.body;

    if (!host) {
      return res.status(400).json({ message: "Host is required" });
    }

    if (!process.env.PORT_SCANNER_URL) {
  throw new Error("PORT_SCANNER_URL not configured");
}

const response = await axios.post(
  `${process.env.PORT_SCANNER_URL}/scan`,
  { host },
  { timeout: 30000 }
);

    const result = response.data;

    if (result.status === "error") {
      return res.status(400).json({ message: result.message });
    }

    const rawPorts = result.open_ports || [];
    const detailedPorts = rawPorts.map((port) => ({
      port,
      description: PORT_DESCRIPTIONS[port] || "Unknown Service"
    }));

    let risk = "Low";
    if (result.total_open > 3) risk = "High";
    else if (result.total_open > 0) risk = "Medium";

    const scan = await PortScan.create({
      user: req.user._id,
      host: result.host,
      open_ports: detailedPorts,
      total_open: result.total_open || 0,
      risk_level: risk
    });

    const io = req.app.get("io");
    if (io) io.emit("newAlert", { type: "Port", target: result.host, risk_level: risk, createdAt: scan.createdAt });

    res.json(scan);

  } catch (error) {
    console.error("Port Scan Error:", error.message);
    res.status(500).json({ message: "Port scan failed" });
  }
};
