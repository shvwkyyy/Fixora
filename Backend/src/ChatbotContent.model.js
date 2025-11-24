const mongoose = require("mongoose");

const chatbotSchema = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        Content_Text: String,
        Content_Image: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("ChatbotContent", chatbotSchema);
