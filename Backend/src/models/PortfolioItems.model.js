const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
    {
        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
            required: true,
        },
        photo: String,
        description: String,
    },
    { timestamps: true }
);

// Add index for frequently queried field
portfolioSchema.index({ workerId: 1 });

module.exports = mongoose.model("PortfolioItem", portfolioSchema);
