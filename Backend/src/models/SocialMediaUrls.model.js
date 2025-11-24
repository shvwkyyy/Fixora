const mongoose = require("mongoose");

const socialMediaSchema = new mongoose.Schema(
    {
        WorkerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
            required: true,
        },
        Platform: String, // facebook, instagram...
        Url: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("SocialMediaUrl", socialMediaSchema);
