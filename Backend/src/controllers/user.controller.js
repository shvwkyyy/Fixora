const User = require("../models/user.model");

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const plain = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  plain.id = plain._id?.toString();
  delete plain.password;
  delete plain.__v;
  return plain;
};

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

exports.listUsers = async (req, res) => {
  try {
    const { userType, city, area, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (userType) filter.userType = userType;
    if (city) filter.city = city;
    if (area) filter.area = area;

    const currentPage = parsePositiveInt(page, 1);
    const perPage = parsePositiveInt(limit, 20);
    const skip = (currentPage - 1) * perPage;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.json({
      ok: true,
      users: users.map(sanitizeUser),
      pagination: {
        total,
        page: currentPage,
        limit: perPage,
        pages: Math.ceil(total / perPage) || 1,
      },
    });
  } catch (err) {
    console.error("list users error", err);
    return res.status(500).json({ ok: false, error: "internal error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, error: "authentication required" });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ ok: false, error: "user not found" });

    return res.json({ ok: true, user: sanitizeUser(user) });
  } catch (err) {
    console.error("get me error", err);
    return res.status(500).json({ ok: false, error: "internal error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ ok: false, error: "userId required" });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ ok: false, error: "user not found" });

    return res.json({ ok: true, user: sanitizeUser(user) });
  } catch (err) {
    console.error("get user by id error", err);
    return res.status(500).json({ ok: false, error: "internal error" });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, error: "authentication required" });

    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "optionalPhone",
      "city",
      "area",
      "profilePhoto",
      "location",
    ];

    const updatePayload = {};
    allowedFields.forEach((field) => {
      if (field in req.body) updatePayload[field] = req.body[field];
    });

    if (!Object.keys(updatePayload).length) {
      return res.status(400).json({ ok: false, error: "no updatable fields provided" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatePayload },
      { new: true }
    ).lean();

    return res.json({ ok: true, user: sanitizeUser(updatedUser) });
  } catch (err) {
    console.error("update me error", err);
    return res.status(500).json({ ok: false, error: "internal error" });
  }
};
