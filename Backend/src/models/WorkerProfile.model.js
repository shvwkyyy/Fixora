const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One-to-one
        },

        specialty: {
            type: String,
            required: true,
        },

        rankScore: {
            type: Number,
            default: 0,
        },

        appliedJobsCount: {
            type: Number,
            default: 0,
        },

        completedJobsCount: {
            type: Number,
            default: 0,
        },

        hourPrice: {
            type: Number,
            required: true,
        },

        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },

        // Social Media URLs (not embedded)
        facebookAccount: String,
        tiktokAccount: String,
        linkedinAccount: String,

        // National ID images
        nationalIdFront: String,
        nationalIdBack: String,
        nationalIdWithFace: String,
    },
    { timestamps: true }
);

// Add indexes for frequently queried fields
workerSchema.index({ userId: 1 });
workerSchema.index({ specialty: 1 });
workerSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model("Worker", workerSchema);
