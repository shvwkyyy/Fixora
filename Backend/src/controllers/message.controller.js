const Message = require("../models/Message.model");
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

module.exports = {
    sendMessage,
    makeConversationId,
};