const mongoose = require("mongoose");

const chatbotSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        contentText: String,
        contentImage: String,
    },
    { timestamps: true }
);

// Add index for frequently queried field
chatbotSchema.index({ userId: 1 });

module.exports = mongoose.model("ChatbotContent", chatbotSchema);
