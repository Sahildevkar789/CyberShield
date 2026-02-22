const Scan = require("../models/Scan");
const PortScan = require("../models/PortScan");

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [websiteScans, portScans, allWebForRisk] = await Promise.all([
      Scan.find({ user: userId }).sort({ createdAt: -1 }).limit(100),
      PortScan.find({ user: userId }).sort({ createdAt: -1 }).limit(100),
      Scan.find({ user: userId }).select("risk_score risk_level createdAt").sort({ createdAt: -1 }).limit(20)
    ]);

    const highRiskWebsites = websiteScans.filter((s) => s.risk_level === "High").length;
    const highRiskPorts = portScans.filter((s) => s.risk_level === "High").length;

    const withScore = allWebForRisk.filter((s) => s.risk_score != null);
    const avgRiskScore =
      withScore.length > 0
        ? Math.round(withScore.reduce((a, s) => a + s.risk_score, 0) / withScore.length)
        : 0;

    const alerts = [];
    [...websiteScans, ...portScans]
      .filter((s) => s.risk_level === "High" || s.risk_level === "Medium")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .forEach((s) => {
        alerts.push({
          type: s.url ? "Website" : "Port",
          target: s.url || s.host,
          risk: s.risk_level,
          date: s.createdAt
        });
      });

    res.json({
      threatStats: {
        highRiskWebsites,
        highRiskPorts,
        totalWebsiteScans: websiteScans.length,
        totalPortScans: portScans.length
      },
      riskScore: Math.min(100, avgRiskScore),
      alerts
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error.message);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
