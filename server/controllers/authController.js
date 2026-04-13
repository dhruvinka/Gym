const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { generateToken } = require("../utils/generateToken");
const MemberProfile = require("../models/MemberProfile");
const PendingUser = require("../models/PendingUser");



// REGISTER

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove previous pending registration if exists
    await PendingUser.deleteOne({ email });

    await PendingUser.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000
    });

    await sendEmail(email, "Gym OTP Verification", `Your OTP is ${otp}`);

    res.status(201).json({
      message: "OTP sent to email. Please verify."
    });

  } catch (error) {
    next(error);
  }
};

//Verify OTP
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const pendingUser = await PendingUser.findOne({ email });

    if (
      !pendingUser ||
      pendingUser.otp !== otp ||
      pendingUser.otpExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Create user
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: "MEMBER",
      isVerified: true
    });

    await PendingUser.deleteOne({ email });

    res.json({
      message: "Email verified and account created successfully"
    });

  } catch (error) {
    next(error);
  }
};


//Resend OTP
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(404).json({ message: "No pending registration found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    pendingUser.otp = otp;
    pendingUser.otpExpiry = Date.now() + 10 * 60 * 1000;

    await pendingUser.save();

    await sendEmail(email, "New OTP", `Your new OTP is ${otp}`);

    res.json({ message: "New OTP sent" });

  } catch (error) {
    next(error);
  }
};


// LOGIN

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //  Trainer activation check
    if (user.role === "TRAINER" && !user.isVerified) {
      return res.status(400).json({
        message: "Trainer account not activated yet"
      });
    }

    //  Member email verification check
    if (user.role === "MEMBER" && !user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    let membership = await MemberProfile.findOne({ userId: user._id });

    let hasMembership = false;
    let plan = null;
    let membershipStatus = "NONE";

    if (membership) {
      // Auto expire if end date passed
      if (membership.endDate && membership.endDate < Date.now()) {
        membership.status = "EXPIRED";
        await membership.save();
      }

      hasMembership = membership.status === "ACTIVE";
      plan = membership.plan;
      membershipStatus = membership.status;
    }

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      hasMembership,
      plan,
      membershipStatus
    });

  } catch (error) {
    next(error);
  }
};


// GET CURRENT USER
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// LOGOUT (Stateless)
exports.logout = async (req, res) => {
  res.json({ message: "Logout successful" });
};


//Forgot PassWord
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    await sendEmail(
      email,
      "Password Reset Request",
      `Click the link to reset your password:\n\n${resetLink}`
    );

    res.json({ message: "Password reset link sent to email" });

  } catch (error) {
    next(error);
  }
};


//Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    next(error);
  }
};

