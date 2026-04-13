const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["ADMIN", "MEMBER", "TRAINER"],
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: String,
    otpExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpiry: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);