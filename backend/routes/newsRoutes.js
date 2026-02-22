const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getCyberNews } = require("../controllers/newsController");

router.get("/", protect, getCyberNews);

module.exports = router;
