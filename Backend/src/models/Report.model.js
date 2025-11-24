const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        Message: String,
        Photo: String, // screenshot
    },
    { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
