const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/register/", registerUser);
router.post("/login", loginUser);
router.post("/login/", loginUser);

// So you can verify auth routes are loaded (GET /api/auth → 200)
router.get("/", (req, res) => res.status(200).json({ ok: true, routes: ["POST /register", "POST /login"] }));

module.exports = router;
