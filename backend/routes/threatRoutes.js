const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { checkVirusTotal } = require("../controllers/threatController");
const { domainIntel } = require("../controllers/domainIntelController");

router.post("/virustotal", protect, checkVirusTotal);
router.post("/domain-intel", protect, domainIntel);
router.get("/domain-intel", protect, domainIntel);

module.exports = router;
