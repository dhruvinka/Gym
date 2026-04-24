const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    plan: {
      type: String,
      enum: ["SIMPLE", "PREMIUM"],
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      default: "INR"
    },

    paymentMode: {
      type: String,
      default: "ONLINE"
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS"
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
