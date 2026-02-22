const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { askAssistant } = require("../controllers/assistantController");

router.post("/", protect, askAssistant);

module.exports = router;