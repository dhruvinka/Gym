const MemberProfile = require("../models/MemberProfile");
const TrainerProfile = require("../models/TrainerProfile");
const DietPlan = require("../models/DietPlan");

// GET MEMBER PROFILE
exports.getProfile = async (userId) => {
  const member = await MemberProfile.findOne({ userId })
    .populate("userId")
    .populate("assignedTrainerId");

  // Add time slot label if premium
  if (member && member.plan === "PREMIUM" && member.timeSlot) {
    const slotLabels = {
      MORNING_5_7: "Morning 5:00 AM - 7:00 AM",
      MORNING_7_9: "Morning 7:00 AM - 9:00 AM",
      MORNING_9_11: "Morning 9:00 AM - 11:00 AM",
      EVENING_5_7: "Evening 5:00 PM - 7:00 PM",
      EVENING_7_9: "Evening 7:00 PM - 9:00 PM",
      EVENING_9_11: "Evening 9:00 PM - 11:00 PM"
    };
    member._doc.timeSlotLabel = slotLabels[member.timeSlot];
  }

  return member;
};

// GET MY SCHEDULE
exports.getMySchedule = async (userId) => {
  const member = await MemberProfile.findOne({ userId });
  if (!member) throw new Error("Member profile not found");

  if (member.plan !== "PREMIUM") {
    throw new Error("Schedule view is only available for PREMIUM members");
  }

  if (!member.assignedTrainerId || !member.timeSlot) {
    throw new Error("No trainer assigned yet");
  }

  const trainer = await TrainerProfile.findById(member.assignedTrainerId)
    .populate("userId", "name");

  const slotLabels = {
    MORNING_5_7: "Morning 5:00 AM - 7:00 AM",
    MORNING_7_9: "Morning 7:00 AM - 9:00 AM",
    MORNING_9_11: "Morning 9:00 AM - 11:00 AM",
    EVENING_5_7: "Evening 5:00 PM - 7:00 PM",
    EVENING_7_9: "Evening 7:00 PM - 9:00 PM",
    EVENING_9_11: "Evening 9:00 PM - 11:00 PM"
  };

  return {
    trainer: {
      name: trainer?.userId?.name,
      specialization: trainer?.specialization,
      experience: trainer?.experience,
      profilePhoto: trainer?.profilePhoto
    },
    timeSlot: member.timeSlot,
    timeSlotLabel: slotLabels[member.timeSlot],
    startDate: member.startDate,
    endDate: member.endDate
  };
};

// GET DIET PLAN
exports.getDietPlan = async (userId) => {
  const member = await MemberProfile.findOne({ userId });
  if (!member) throw new Error("Member profile not found");

  if (member.plan !== "PREMIUM" || member.status !== "ACTIVE") {
    throw new Error("Diet plan available only for ACTIVE Premium members");
  }

  return await DietPlan.find({
    memberId: member._id
  }).populate("trainerId");
};