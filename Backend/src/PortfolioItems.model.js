const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
    {
        WorkerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
            required: true,
        },
        Photo: String,
        Description: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("PortfolioItem", portfolioSchema);
