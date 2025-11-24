const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    FName: {
      type: String,
      required: true,
      trim: true,
    },

    LName: {
      type: String,
      required: true,
      trim: true,
    },

    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email"],
    },

    Password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    Phone: {
      type: String,
      required: true,
      trim: true,
    },

    OptionalPhone: {
      type: String,
      default: "",
    },

    ProfilePhoto: {
      type: String,
      default: "",
    },

    City: {
      type: String,
      required: true,
    },

    Area: {
      type: String,
      required: true,
    },

    UserType: {
      type: String,
      enum: ["user", "worker", "admin"],
      default: "user",
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
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.Password = await bcrypt.hash(this.Password, salt);
  next();
});

// Compare Password Method
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.Password);
};

module.exports = mongoose.model("User", userSchema);
