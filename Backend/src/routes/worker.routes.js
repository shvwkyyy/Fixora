const express = require("express");
const router = express.Router();
const controller = require("../controllers/worker.controller");
const jwtMiddleware = require("../middleware/jwtMiddleware");

router.get("/", controller.listWorkers);
router.get("/:workerId", controller.getWorkerProfile);
router.put("/me", jwtMiddleware, controller.upsertMyProfile);

module.exports = router;
