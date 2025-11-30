const express = require("express");
const router = express.Router();
const controller = require("../controllers/review.controller");
const jwtMiddleware = require("../middleware/jwtMiddleware");

router.get("/worker/:workerId", controller.getWorkerReviews);
router.post("/", jwtMiddleware, controller.createReview);
router.delete("/:reviewId", jwtMiddleware, controller.deleteReview);

module.exports = router;
