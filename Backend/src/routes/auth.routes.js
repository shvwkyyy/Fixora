const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const jwtMiddleware = require("../middleware/jwtMiddleware");

// Public Routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);

// Protected Route
router.get("/getprofile", jwtMiddleware, authController.me);
router.post("/logout", authController.logout);

module.exports = router;
