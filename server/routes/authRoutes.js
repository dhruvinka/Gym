const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");


const {
  register,
  login,
  getMe,
  logout,
  verifyOtp,
  forgotPassword,
  resetPassword,
  resendOtp
} = require("../controllers/authController");

const { authMiddleware } = require("../middleware/authMiddleware");

//  PUBLIC ROUTES - NO MIDDLEWARE
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOtp);

// PROTECTED ROUTES - WITH MIDDLEWARE
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

module.exports = router;