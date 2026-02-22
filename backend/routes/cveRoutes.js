const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { searchCVE } = require("../controllers/cveController");

router.post("/search", protect, searchCVE);

module.exports = router;
