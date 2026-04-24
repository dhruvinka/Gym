const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const MemberProfile = require("../models/MemberProfile");
const TrainerProfile = require("../models/TrainerProfile");
const plans = require("../config/plans");

// DEFINE TIME_SLOTS at the top of the file
const TIME_SLOTS = {
  MORNING_5_7: { label: "Morning 5:00 AM - 7:00 AM", capacity: 5 },
  MORNING_7_9: { label: "Morning 7:00 AM - 9:00 AM", capacity: 5 },
  MORNING_9_11: { label: "Morning 9:00 AM - 11:00 AM", capacity: 5 },
  EVENING_5_7: { label: "Evening 5:00 PM - 7:00 PM", capacity: 5 },
  EVENING_7_9: { label: "Evening 7:00 PM - 9:00 PM", capacity: 5 },
  EVENING_9_11: { label: "Evening 9:00 PM - 11:00 PM", capacity: 5 }
};

// CREATE ORDER
exports.createOrder = async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!plans[plan]) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const selectedPlan = plans[plan];

    const order = await razorpay.orders.create({
      amount: selectedPlan.price,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    res.json(order);

  } catch (error) {
    next(error);
  }
};

// GET AVAILABLE TIME SLOTS
exports.getAvailableTimeSlots = async (req, res, next) => {
  try {
    console.log("Getting available time slots...");

    // Get all active trainers
    const trainers = await TrainerProfile.find({ activeStatus: true })
      .populate('userId', 'name specialization');

    console.log(`Found ${trainers.length} active trainers`);

    // Calculate availability for each slot
    const slotAvailability = Object.keys(TIME_SLOTS).map(slotKey => {
      let totalMembers = 0;
      let totalCapacity = trainers.length * 5;
      let availableTrainers = 0;

      // Get trainers available in this slot
      const trainersInSlot = trainers
        .filter(trainer => {
          const membersInSlot = trainer.currentSlotMembers?.[slotKey] || 0;
          totalMembers += membersInSlot;
          const isAvailable = membersInSlot < 5;
          if (isAvailable) availableTrainers++;
          return isAvailable;
        })
        .map(trainer => ({
          id: trainer._id,
          name: trainer.userId?.name,
          specialization: trainer.specialization,
          availableSpots: 5 - (trainer.currentSlotMembers?.[slotKey] || 0)
        }));

      return {
        value: slotKey,
        label: TIME_SLOTS[slotKey].label,
        currentMembers: totalMembers,
        totalCapacity,
        availableSpots: totalCapacity - totalMembers,
        availableTrainers,
        trainers: trainersInSlot, // Include trainer details for frontend
        isAvailable: (totalCapacity - totalMembers) > 0
      };
    });

    console.log("Sending slot availability data");
    res.json(slotAvailability);

  } catch (error) {
    console.error("Error in getAvailableTimeSlots:", error);
    next(error);
  }
};

// VERIFY PAYMENT (with optional trainer selection)
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      timeSlot
    } = req.body;

    console.log("Verifying payment:", { razorpay_order_id, plan, timeSlot });

    //  Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed - Invalid signature"
      });
    }

    // Validate plan
    if (!plans[plan]) {
      return res.status(400).json({
        message: "Invalid plan"
      });
    }

    const selectedPlan = plans[plan];

    //  Validate time slot for premium members
    if (plan === "PREMIUM") {
      if (!timeSlot) {
        return res.status(400).json({
          message: "Please select a time slot for premium membership"
        });
      }

      if (!TIME_SLOTS[timeSlot]) {
        return res.status(400).json({
          message: "Invalid time slot selected"
        });
      }
    }

    // Save payment record
    const payment = await Payment.create({
      userId: req.user.id,
      plan: selectedPlan.name,
      amount: selectedPlan.price,
      currency: "INR",
      paymentMode: "ONLINE",
      status: "SUCCESS",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    });

    console.log("Payment saved:", payment._id);

    //  Calculate membership dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + selectedPlan.durationInDays);

    //  Prepare member profile update
    const updateData = {
      plan: selectedPlan.name,
      status: "ACTIVE",
      startDate,
      endDate
    };

    // Save preferred time slot for premium (admin will assign trainer manually)
    if (plan === "PREMIUM" && timeSlot) {
      updateData.timeSlot = timeSlot;
    }

    // Update or create member profile
    const membership = await MemberProfile.findOneAndUpdate(
      { userId: req.user.id },
      updateData,
      { upsert: true, new: true }
    );

    console.log("Membership activated:", membership._id);

    // Send success response
    res.json({
      message: "Payment successful. Membership activated.",
      payment: {
        id: payment._id,
        amount: payment.amount,
        plan: payment.plan
      },
      membership: {
        id: membership._id,
        plan: membership.plan,
        status: membership.status,
        startDate: membership.startDate,
        endDate: membership.endDate,
        timeSlot: membership.timeSlot
      }
    });

  } catch (error) {
    console.error("Error in verifyPayment:", error);
    next(error);
  }
};

// GET MY PAYMENTS
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    next(error);
  }
};

// ADMIN: GET ALL PAYMENTS
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "name email");

    res.json(payments);
  } catch (error) {
    next(error);
  }
};