const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        Sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        Receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        Content_Text: String,
        Content_Image: String,
        Read_Status: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
