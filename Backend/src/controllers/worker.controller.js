const Worker = require("../models/WorkerProfile.model");
const User = require("../models/user.model");

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

exports.listWorkers = async (req, res) => {
  try {
    const { specialty, city, verificationStatus, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (specialty) filter.specialty = specialty;
    if (verificationStatus) filter.verificationStatus = verificationStatus;

    // Handle search query - search by specialty, city, or worker name
    if (search) {
      const searchLower = search.toLowerCase();
      
      // First, try to find matching users by name or city
      const userFilter = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { area: { $regex: search, $options: 'i' } }
        ]
      };
      
      const matchingUsers = await User.find(userFilter).select("_id").lean();
      const userIds = matchingUsers.map((doc) => doc._id);
      
      // Also check if search matches any specialty
      const specialtyMatch = {
        specialty: { $regex: search, $options: 'i' }
      };
      
      if (userIds.length > 0) {
        filter.$or = [
          { userId: { $in: userIds } },
          specialtyMatch
        ];
      } else {
        filter.specialty = { $regex: search, $options: 'i' };
      }
    }

    if (city) {
      const candidateIds = await User.find({ city }).select("_id").lean();
      const ids = candidateIds.map((doc) => doc._id);
      if (!ids.length) {
        return res.json({
          ok: true,
          workers: [],
          pagination: { total: 0, page: 1, limit: parsePositiveInt(limit, 20), pages: 0 },
        });
      }
      // Combine with existing filter if search was used
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { userId: { $in: ids } }
        ];
        delete filter.$or;
      } else {
        filter.userId = { $in: ids };
      }
    }

    const currentPage = parsePositiveInt(page, 1);
    const perPage = parsePositiveInt(limit, 20);
    const skip = (currentPage - 1) * perPage;

    // Ensure we populate userId properly and only show workers with specialty
    const query = Worker.find(filter)
      .populate("userId", "firstName lastName email phone city area userType profilePhoto")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();

    const [workers, total] = await Promise.all([query, Worker.countDocuments(filter)]);

    // Filter out workers without specialty (shouldn't happen but just in case)
    const validWorkers = workers.filter(worker => worker.specialty && worker.specialty.trim());
    
    console.log('List workers:', {
      filter,
      totalFound: workers.length,
      validWorkers: validWorkers.length,
      workers: validWorkers.map(w => ({ id: w._id, specialty: w.specialty, userId: w.userId?.firstName }))
    });
    
    // Recalculate total count for valid workers
    const validTotal = await Worker.countDocuments({
      ...filter,
      specialty: { $exists: true, $ne: '' }
    });

    return res.json({
      ok: true,
      workers: validWorkers,
      pagination: {
        total: validTotal,
        page: currentPage,
        limit: perPage,
        pages: Math.ceil(validTotal / perPage) || 1,
      },
    });
  } catch (err) {
    console.error("list workers error", err);
    return res.status(500).json({ ok: false, error: "internal error" });
  }
};

exports.getWorkerProfile = async (req, res) => {
  try {
    const workerId = req.params.workerId || req.params.id;
    if (!workerId) return res.status(400).json({ ok: false, error: "workerId required" });

    const worker = await Worker.findById(workerId)
      .populate("userId", "firstName lastName email phone city area profilePhoto userType")
      .lean();

    if (!worker) return res.status(404).json({ ok: false, error: "worker not found" });

    return res.json({ ok: true, worker });
  } catch (err) {
    console.error("get worker profile error", err);
    return res.status(500).json({ ok: false, error: "internal error" });
  }
};

exports.upsertMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, error: "authentication required" });

    const allowedFields = [
      "specialty",
      "hourPrice",
      "facebookAccount",
      "tiktokAccount",
      "linkedinAccount",
      "nationalIdFront",
      "nationalIdBack",
      "nationalIdWithFace",
    ];

    const updatePayload = {};
    allowedFields.forEach((field) => {
      if (field in req.body) updatePayload[field] = req.body[field];
    });

    if (!Object.keys(updatePayload).length) {
      return res.status(400).json({ ok: false, error: "no updatable fields provided" });
    }

    const workerProfile = await Worker.findOneAndUpdate(
      { userId },
      { $set: updatePayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("userId", "firstName lastName email phone city area profilePhoto userType");

    await User.updateOne({ _id: userId }, { $set: { userType: "worker" } });

    return res.json({ ok: true, worker: workerProfile });
  } catch (err) {
    console.error("upsert worker profile error", err);
    return res.status(500).json({ ok: false, error: "internal error" });
  }
};
