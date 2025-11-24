const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        WorkerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
            required: true,
        },
        Rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        Comment: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
