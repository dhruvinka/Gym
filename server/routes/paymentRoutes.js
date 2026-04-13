const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  getMyPayments,
  getAllPayments,
  getAvailableTimeSlots
} = require("../controllers/paymentController");

const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

// Create Order
router.post("/create-order", authMiddleware, createOrder);

// Get available time slots
router.get("/available-slots", authMiddleware, getAvailableTimeSlots);

// Verify Payment
router.post("/verify-payment", authMiddleware, verifyPayment);

// Member Payment History
router.get("/my-payments", authMiddleware, roleMiddleware("MEMBER"), getMyPayments);

// Admin View All
router.get("/", authMiddleware, roleMiddleware("ADMIN"), getAllPayments);

module.exports = router;