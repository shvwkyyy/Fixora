const Notification = require("../models/Notification.models");
const { getIO } = require("../sockets/sockets");

const normalizeId = (value) => (value ? value.toString() : null);

const markAsRead = async (req, res) => {
    try {
        const userId = normalizeId(req.user?.id || req.user?._id);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
        return res.json({ success: true });
    } catch (err) {
        console.error("markAsRead error", err);
        return res.status(500).json({ success: false, message: "server error" });
    }
};

const getNotifications = async (req, res) => {
    try {
        const userId = normalizeId(req.user?.id || req.user?._id);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Notification.countDocuments({ userId }),
        ]);

        return res.json({
            success: true,
            data,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit) || 1,
            },
        });
    } catch (err) {
        console.error("getNotifications error", err);
        return res.status(500).json({ success: false, message: "server error" });
    }
};

const createNotification = async ({ userId, senderId = null, content, type = "general" }) => {
    if (!userId || !content) throw new Error("userId and content are required");
    const doc = await Notification.create({
        userId,
        senderId,
        notificationContent: content,
        type,
        isRead: false,
    });

    try {
        const io = getIO();
        io.to(`user:${normalizeId(userId)}`).emit("notification:new", doc);
    } catch (err) {
        console.warn("notification emit failed", err?.message || err);
    }

    return doc;
};

module.exports = { createNotification, getNotifications, markAsRead };