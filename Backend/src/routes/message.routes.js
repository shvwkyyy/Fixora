const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getConversationMessages,
} = require("../controllers/message.controller");
const jwtMiddleware = require("../middleware/jwtMiddleware");
router.post("/", jwtMiddleware, sendMessage);
router.get("/conversations", jwtMiddleware, getConversations);
router.get("/conversation/:otherUserId", jwtMiddleware, getConversationMessages);

module.exports = router;

