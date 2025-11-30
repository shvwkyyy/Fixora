const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const jwtMiddleware = require("../middleware/jwtMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);

router.get("/getprofile", jwtMiddleware, authController.getprofile);
router.post("/logout", authController.logout);

module.exports = router;
