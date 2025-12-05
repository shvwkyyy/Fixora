const User = require("../models/user.model");
const Worker = require("../models/WorkerProfile.model");
const bcrypt = require("bcryptjs");

const {
  signAccessToken,
  signRefreshToken,
  verifyToken
} = require("../utils/jwt");


const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const plain = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  plain.id = plain._id?.toString();
  delete plain.password;
  delete plain.__v;
  return plain;
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, city, area, userType = "user", specialty, hourPrice } = req.body;

    if (!firstName || !lastName || !email || !password || !phone || !city || !area) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate worker-specific fields
    if (userType === "worker") {
      if (!specialty) {
        return res.status(400).json({ message: "Specialty is required for workers" });
      }
      if (!hourPrice || hourPrice <= 0) {
        return res.status(400).json({ message: "Hour price is required and must be greater than 0 for workers" });
      }
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      city,
      area,
      userType,
    });

    // Create WorkerProfile if user is a worker
    if (userType === "worker" && specialty && hourPrice) {
      try {
        await Worker.create({
          userId: user._id,
          specialty,
          hourPrice: Number(hourPrice),
          verificationStatus: "pending",
        });
      } catch (workerErr) {
        console.error("Error creating worker profile:", workerErr);
        // Don't fail registration if worker profile creation fails, but log it
        // The worker can update their profile later
      }
    }

    const safeUser = sanitizeUser(user);

    const accessToken = signAccessToken({
      id: user._id,
      role: user.userType,
    });

    const refreshToken = signRefreshToken({
      id: user._id,
    });

    return res.status(201).json({
      message: "registered successfully",
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Invalid email or password" });

    const payload = {
      id: user._id,
      role: user.userType,
    };

    const accessToken = signAccessToken(payload);

    const refreshToken = signRefreshToken({
      id: user._id,
    });

    const safeUser = sanitizeUser(user);

    res.json({
      message: "Login Successful",
      user: safeUser,
      accessToken,
      refreshToken,
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token required" });

    const decoded = verifyToken(refreshToken);

    if (!decoded)
      return res.status(401).json({ message: "Invalid or expired refresh token" });

    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const payload = {
      id: user._id,
      role: user.userType,
    };

    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken({ id: user._id });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: sanitizeUser(user),
    });

  } catch (err) {
    console.error("Refresh Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getprofile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error("Me Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.logout = async (req, res) => {
  return res.json({ message: "Logout successful (delete tokens from client)" });
};

