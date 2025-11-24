const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
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
        Problem_Description: {
            type: String,
            required: true,
        },
        Status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "in_progress", "completed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", requestSchema);
