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

router.post("/create-order", authMiddleware, createOrder);
router.get("/available-slots", authMiddleware, getAvailableTimeSlots);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.get("/my-payments", authMiddleware, roleMiddleware("MEMBER"), getMyPayments);
router.get("/", authMiddleware, roleMiddleware("ADMIN"), getAllPayments);

module.exports = router;