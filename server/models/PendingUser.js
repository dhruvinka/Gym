const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true
    },
    password: String,
    otp: String,
    otpExpiry: Date
  },
  { timestamps: true }
);

// Auto delete after OTP expiry
pendingUserSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PendingUser", pendingUserSchema);
