const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { generateReport, getReportPreview } = require("../controllers/reportController");

router.get("/preview", protect, getReportPreview);
router.get("/", protect, generateReport);

module.exports = router;
