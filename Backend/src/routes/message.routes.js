const express = require("express");
const router = express.Router();
const { sendMessage, makeConversationId } = require("../controllers/message.controller");
const Message = require("../models/Message.model");
const User = require("../models/user.model");
const jwtMiddleware = require("../middleware/jwtMiddleware");

// Send a message
router.post("/", jwtMiddleware, sendMessage);

// Get all conversations for current user
router.get("/conversations", jwtMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "authentication required" });
    }

    // Get all unique conversation IDs for this user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiverId", userId] }, { $eq: ["$isRead", false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);

    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const lastMsg = conv.lastMessage;
        const senderIdStr = lastMsg.senderId?.toString() || String(lastMsg.senderId);
        const receiverIdStr = lastMsg.receiverId?.toString() || String(lastMsg.receiverId);
        const userIdStr = userId.toString();
        
        const otherUserId = senderIdStr === userIdStr ? lastMsg.receiverId : lastMsg.senderId;
        
        const otherUser = await User.findById(otherUserId).select("firstName lastName email profilePhoto");
        
        if (!otherUser) {
          return null;
        }
        
        return {
          conversationId: conv._id,
          otherUser: {
            id: otherUser._id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            email: otherUser.email,
            profilePhoto: otherUser.profilePhoto,
          },
          lastMessage: {
            contentText: lastMsg.contentText,
            contentImage: lastMsg.contentImage,
            createdAt: lastMsg.createdAt,
            senderId: lastMsg.senderId,
          },
          unreadCount: conv.unreadCount,
        };
      })
    );

    // Filter out null values
    const validConversations = populatedConversations.filter(conv => conv !== null);

    return res.json({ success: true, conversations: validConversations });
  } catch (err) {
    console.error("get conversations error", err);
    return res.status(500).json({ success: false, error: "internal error" });
  }
});

// Get messages for a specific conversation
router.get("/conversation/:otherUserId", jwtMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { otherUserId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: "authentication required" });
    }

    const conversationId = makeConversationId(userId, otherUserId);
    
    const messages = await Message.find({ conversationId })
      .populate("senderId", "firstName lastName profilePhoto")
      .populate("receiverId", "firstName lastName profilePhoto")
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read
    await Message.updateMany(
      { conversationId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.json({ success: true, messages });
  } catch (err) {
    console.error("get messages error", err);
    return res.status(500).json({ success: false, error: "internal error" });
  }
});

module.exports = router;

