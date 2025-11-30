const express = require("express");
const router = express.Router();
const controller = require("../controllers/notification.controller");
const jwtMiddleware = require("../middleware/jwtMiddleware");

router.use(jwtMiddleware);
router.get("/", controller.getNotifications);
router.post("/mark-read", controller.markAsRead);

module.exports = router;