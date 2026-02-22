const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { scanPorts } = require("../controllers/portScanController");

router.post("/", protect, scanPorts);

module.exports = router;
