const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One-to-one
        },

        Specialty: {
            type: String,
            required: true,
        },

        RankScore: {
            type: Number,
            default: 0,
        },

        AppliedJobsCount: {
            type: Number,
            default: 0,
        },

        CompletedJobsCount: {
            type: Number,
            default: 0,
        },

        HourPrice: {
            type: Number,
            required: true,
        },

        VerificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },

        // Social Media URLs (not embedded)
        Facebook_Account: String,
        TikTok_Account: String,
        LinkedIn_Account: String,

        // National ID images
        National_Id_Front: String,
        National_Id_Back: String,
        National_Id_With_Face: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Worker", workerSchema);
