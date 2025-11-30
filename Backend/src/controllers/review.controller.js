const Review = require("../models/Review.models");
const Worker = require("../models/WorkerProfile.model");

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

exports.createReview = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, error: "authentication required" });

    const { workerId, rating, comment = "" } = req.body;
    if (!workerId || typeof workerId !== "string") {
      return res.status(400).json({ ok: false, error: "workerId required" });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ ok: false, error: "rating must be between 1 and 5" });
    }

    const workerExists = await Worker.exists({ _id: workerId });
    if (!workerExists) {
      return res.status(404).json({ ok: false, error: "worker not found" });
    }

    const review = await Review.findOneAndUpdate(
      { userId, workerId },
      { $set: { rating: numericRating, comment } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ ok: true, review });
  } catch (err) {
    console.error("create review error", err);
    return res.status(500).json({ ok: false, error: "internal error" });
  }
};

exports.getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;
    if (!workerId) return res.status(400).json({ ok: false, error: "workerId required" });

    const { page = 1, limit = 20 } = req.query;
    const currentPage = parsePositiveInt(page, 1);
    const perPage = parsePositiveInt(limit, 20);
    const skip = (currentPage - 1) * perPage;

    const [reviews, total] = await Promise.all([
      Review.find({ workerId })
        .populate("userId", "firstName lastName profilePhoto city area")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      Review.countDocuments({ workerId }),
    ]);

    return res.json({
      ok: true,
      reviews,
      pagination: {
        total,
        page: currentPage,
        limit: perPage,
        pages: Math.ceil(total / perPage) || 1,
      },
    });
  } catch (err) {
    console.error("get worker reviews error", err);
    return res.status(500).json({ ok: false, error: "internal error" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, error: "authentication required" });

    const { reviewId } = req.params;
    if (!reviewId) return res.status(400).json({ ok: false, error: "reviewId required" });

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ ok: false, error: "review not found" });

    const isOwner = String(review.userId) === String(userId);
    const isAdmin = req.user?.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ ok: false, error: "not authorized to delete" });
    }

    await review.deleteOne();
    return res.json({ ok: true, message: "review deleted" });
  } catch (err) {
    console.error("delete review error", err);
    return res.status(500).json({ ok: false, error: "internal error" });
  }
};
