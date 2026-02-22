const Scan = require("../models/Scan");
const PortScan = require("../models/PortScan");

exports.getHistory = async (req, res) => {
  try {
    const websiteScans = await Scan.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    const portScans = await PortScan.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      websiteScans,
      portScans
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};