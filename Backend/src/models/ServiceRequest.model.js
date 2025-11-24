const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
            required: true,
        },
        problemDescription: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "in_progress", "completed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Add indexes for frequently queried fields
requestSchema.index({ userId: 1, status: 1 });
requestSchema.index({ workerId: 1, status: 1 });
requestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ServiceRequest", requestSchema);
