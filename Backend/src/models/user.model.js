const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email"],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => validator.isMobilePhone(v, "ar-EG"),
        message: "Invalid phone number",
      },
    },

    optionalPhone: { type: String, default: "" },

    profilePhoto: { type: String, default: "" },

    city: { type: String, required: true },
    area: { type: String, required: true },

    userType: {
      type: String,
      enum: ["user", "worker", "admin"],
      default: "user",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ location: "2dsphere" });
userSchema.index({ userType: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
