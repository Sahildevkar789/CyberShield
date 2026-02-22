const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  getSystemStats,
  deleteUser
} = require("../controllers/adminController");

router.get("/users", protect, adminOnly, getAllUsers);
router.get("/stats", protect, adminOnly, getSystemStats);
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;
