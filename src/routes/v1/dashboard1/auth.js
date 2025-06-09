const express = require("express");
const AuthController = require("../../../controllers/AuthController");
const { authMiddleware } = require("../../../middlewares/authMiddleware");

const router = express.Router();
const authController = new AuthController();

// Public routes (no authentication required)
router.post("/login", authController.login);
router.post("/register", authController.register);

// Protected routes (authentication required)
router.post("/logout", authMiddleware, authController.logout);
router.get("/profile", authMiddleware, authController.profile);

module.exports = router;
