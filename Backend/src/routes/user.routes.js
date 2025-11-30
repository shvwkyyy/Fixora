const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const jwtMiddleware = require("../middleware/jwtMiddleware");

router.use(jwtMiddleware);
router.get("/", controller.listUsers);
router.get("/me", controller.getMe);
router.put("/me", controller.updateMe);
router.get("/:userId", controller.getUserById);

module.exports = router;
