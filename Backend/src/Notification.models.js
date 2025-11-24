const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId, // Receiver
            ref: "User",
            required: true,
        },
        Sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        Notification_Content: String,
        Type: String,
        IsRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
