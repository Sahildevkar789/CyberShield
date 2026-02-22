const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { checkPhishing } = require("../controllers/phishingController");

router.post("/", protect, checkPhishing);

module.exports = router;
