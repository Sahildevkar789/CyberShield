const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { websiteScan } = require("../controllers/scanController");

router.post("/website", protect, websiteScan);

module.exports = router;