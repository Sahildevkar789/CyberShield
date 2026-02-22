const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { checkPassword } = require("../controllers/passwordController");

router.post("/", protect, checkPassword);

module.exports = router;
