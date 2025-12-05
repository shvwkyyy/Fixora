const mongoose = require("mongoose");
const Message = require("../models/Message.model");
const User = require("../models/user.model");
const { getIO } = require("../sockets/sockets");

function makeConversationId(a, b) {
    const s1 = a?.toString();
    const s2 = b?.toString();
    if (!s1 || !s2) return "";
    return s1 < s2 ? `${s1}_${s2}` : `${s2}_${s1}`;
}

const sendMessage = async (req, res) => {
    try {
        const senderId = req.user?.id || req.user?._id;
        if (!senderId) {
            return res.status(401).json({ success: false, error: "authentication required" });
        }

        const { receiverId, contentText, contentImage } = req.body;
        if (!receiverId) {
            return res.status(400).json({ success: false, error: "receiverId is required" });
        }
        if (!contentText && !contentImage) {
            return res.status(400).json({ success: false, error: "contentText or contentImage required" });
        }

        const conversationId = makeConversationId(senderId, receiverId);
        const message = await Message.create({
            conversationId,
            senderId,
            receiverId,
            contentText: contentText || null,
            contentImage: contentImage || null,
            isRead: false,
        });

        try {
            const io = getIO();
            io.to(`user:${receiverId}`).to(`user:${senderId}`).emit("message:new", message);
        } catch (emitError) {
            console.warn("message emit failed", emitError?.message || emitError);
        }

        return res.status(201).json({ success: true, message });
    } catch (err) {
        console.error("sendMessage error", err);
        return res.status(500).json({ success: false, error: "internal error" });
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, error: "authentication required" });
        }

        const userObjectId = new mongoose.Types.ObjectId(String(userId));

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ senderId: userObjectId }, { receiverId: userObjectId }]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$conversationId",
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$receiverId", userObjectId] }, { $eq: ["$isRead", false] }] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { "lastMessage.createdAt": -1 } }
        ]);

        const populated = await Promise.all(
            conversations.map(async (conv) => {
                const lastMsg = conv.lastMessage;
                const senderIdStr = lastMsg.senderId?.toString() || String(lastMsg.senderId);
                const userIdStr = userObjectId.toString();
                const otherUserId = senderIdStr === userIdStr ? lastMsg.receiverId : lastMsg.senderId;

                const otherUser = await User.findById(otherUserId).select("firstName lastName email profilePhoto");
                if (!otherUser) return null;

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

        const valid = populated.filter(Boolean);
        return res.json({ success: true, conversations: valid });
    } catch (err) {
        console.error("get conversations error", err);
        return res.status(500).json({ success: false, error: "internal error" });
    }
};

const getConversationMessages = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { otherUserId } = req.params;
        if (!userId) {
            return res.status(401).json({ success: false, error: "authentication required" });
        }

        const conversationId = makeConversationId(String(userId), String(otherUserId));

        const messages = await Message.find({ conversationId })
            .populate("senderId", "firstName lastName profilePhoto")
            .populate("receiverId", "firstName lastName profilePhoto")
            .sort({ createdAt: 1 })
            .lean();

        await Message.updateMany(
            { conversationId, receiverId: new mongoose.Types.ObjectId(String(userId)), isRead: false },
            { $set: { isRead: true } }
        );

        return res.json({ success: true, messages });
    } catch (err) {
        console.error("get messages error", err);
        return res.status(500).json({ success: false, error: "internal error" });
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getConversationMessages,
    makeConversationId,
};