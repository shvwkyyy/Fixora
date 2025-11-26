const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

const {
  signAccessToken,
  signRefreshToken,
  verifyToken
} = require("../utils/jwt");


// REGISTER
exports.register = async (req, res) => {
  try {
    const { FName, LName, Email, Password, Phone, City, Area, UserType } = req.body;


    const exists = await User.findOne({ Email });
    if (exists)
      return res.status(400).json({ message: "Wrong Email or Password" });

    const hashed = await bcrypt.hash(Password, 10);

    const user = await User.create({
      FName,
      LName,
      Email,
      Password: hashed,
      Phone,
      City,
      Area,
      UserType,
    });


    const accessToken = signAccessToken({
      id: user._id,
      role: user.UserType,
    });

    const refreshToken = signRefreshToken({
      id: user._id,
    });

    return res.status(201).json({
      message: "registed successful",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const user = await User.findOne({ Email }).select("+Password");
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const valid = await bcrypt.compare(Password, user.Password);
    if (!valid)
      return res.status(400).json({ message: "Invalid email or password" });

    const accessToken = signAccessToken({
      id: user._id,
      role: user.userType,
    });

    const refreshToken = signRefreshToken({
      id: user._id,
    });

    res.json({
      message: "Login Successful",
      user,
      accessToken,
      refreshToken,
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};


// REFRESH TOKEN
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

    const newAccess = signAccessToken({
      id: user._id,
      role: user.userType,
    });

    res.json({
      accessToken: newAccess,
    });

  } catch (err) {
    console.error("Refresh Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};


// GET PROFILE
exports.getprofile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-Password");
    return res.json({ user });
  } catch (err) {
    console.error("Me Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};


// LOGOUT
exports.logout = async (req, res) => {
  return res.json({ message: "Logout successful (delete tokens from client)" });
};

