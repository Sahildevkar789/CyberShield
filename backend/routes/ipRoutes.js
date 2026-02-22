const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { checkIPReputation } = require("../controllers/ipController");

router.post("/reputation", protect, checkIPReputation);

module.exports = router;
