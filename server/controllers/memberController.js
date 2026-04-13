const memberService = require("../services/memberService");
const MemberProfile = require("../models/MemberProfile");
const Payment = require("../models/Payment");
const TrainerProfile = require("../models/TrainerProfile"); // ✅ ADD THIS

// GET MY TRAINER
exports.getMyTrainer = async (req, res, next) => {
  try {
    const member = await MemberProfile.findOne({ userId: req.user.id });
    
    if (!member) {
      return res.status(404).json({ message: "Member profile not found" });
    }

    // Check if premium member
    if (member.plan !== "PREMIUM") {
      return res.status(403).json({ 
        message: "Trainer assignment is only for PREMIUM members" 
      });
    }

    // Get assigned trainer
    if (!member.assignedTrainerId) {
      return res.status(404).json({ 
        message: "No trainer assigned yet" 
      });
    }

    const trainer = await TrainerProfile.findById(member.assignedTrainerId)
      .populate("userId", "name email");

    if (!trainer) {
      return res.status(404).json({ 
        message: "Trainer not found" 
      });
    }

    const slotLabels = {
      MORNING_5_7: "Morning 5:00 AM - 7:00 AM",
      MORNING_7_9: "Morning 7:00 AM - 9:00 AM",
      MORNING_9_11: "Morning 9:00 AM - 11:00 AM",
      EVENING_5_7: "Evening 5:00 PM - 7:00 PM",
      EVENING_7_9: "Evening 7:00 PM - 9:00 PM",
      EVENING_9_11: "Evening 9:00 PM - 11:00 PM"
    };

    res.json({
      trainer: {
        id: trainer._id,
        name: trainer.userId?.name,
        specialization: trainer.specialization,
        experience: trainer.experience,
        email: trainer.userId?.email
      },
      timeSlot: member.timeSlot,
      timeSlotLabel: slotLabels[member.timeSlot],
      assignedSince: member.startDate
    });

  } catch (error) {
    console.error("Error in getMyTrainer:", error);
    next(error);
  }
};

// GET PROFILE
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await memberService.getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await MemberProfile.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    ).populate("userId");
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// VIEW SUBSCRIPTION
exports.getSubscription = async (req, res, next) => {
  try {
    const subscription = await MemberProfile.findOne({
      userId: req.user.id
    });
    
    if (subscription && subscription.plan === "PREMIUM" && subscription.timeSlot) {
      const slotLabels = {
        MORNING_5_7: "Morning 5:00 AM - 7:00 AM",
        MORNING_7_9: "Morning 7:00 AM - 9:00 AM",
        MORNING_9_11: "Morning 9:00 AM - 11:00 AM",
        EVENING_5_7: "Evening 5:00 PM - 7:00 PM",
        EVENING_7_9: "Evening 7:00 PM - 9:00 PM",
        EVENING_9_11: "Evening 9:00 PM - 11:00 PM"
      };
      subscription._doc.timeSlotLabel = slotLabels[subscription.timeSlot];
    }

    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

// GET MY SCHEDULE
exports.getMySchedule = async (req, res, next) => {
  try {
    const schedules = await memberService.getMySchedule(req.user.id);
    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

// GET DIET PLAN
exports.getDietPlan = async (req, res, next) => {
  try {
    const member = await MemberProfile.findOne({
      userId: req.user.id
    });

    if (!member || member.plan !== "PREMIUM") {
      return res.status(403).json({
        message: "Only Premium members can access diet plans."
      });
    }

    const plans = await memberService.getDietPlan(req.user.id);
    res.json(plans);
  } catch (error) {
    next(error);
  }
};