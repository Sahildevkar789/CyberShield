const User = require("../models/User");
const Scan = require("../models/Scan");
const PortScan = require("../models/PortScan");
const PasswordScan = require("../models/PasswordScan");
const PhishingScan = require("../models/PhishingScan");

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

exports.getSystemStats = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalWebsiteScans = await Scan.countDocuments();
  const totalPortScans = await PortScan.countDocuments();
  const totalPasswordChecks = await PasswordScan.countDocuments();
  const totalPhishingChecks = await PhishingScan.countDocuments();

  res.json({
    totalUsers,
    totalWebsiteScans,
    totalPortScans,
    totalPasswordChecks,
    totalPhishingChecks
  });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};
