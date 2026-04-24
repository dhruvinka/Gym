const TrainerProfile = require("../models/TrainerProfile");
const MemberProfile = require("../models/MemberProfile");
const DietPlan = require("../models/DietPlan");

// GET PROFILE
exports.getTrainerProfile = async (userId) => {
  return await TrainerProfile.findOne({ userId }).populate("userId");
};

// UPDATE PROFILE
exports.updateTrainerProfile = async (userId, data) => {
  return await TrainerProfile.findOneAndUpdate(
    { userId },
    data,
    { new: true }
  );
};

// GET MY SCHEDULES 
exports.getTrainerSchedules = async (userId) => {
  const trainer = await TrainerProfile.findOne({ userId });
  if (!trainer) throw new Error("Trainer profile not found");

  // Return slot information instead of schedules
  const slots = [
    { slot: "MORNING_5_7", label: "Morning 5-7", current: trainer.currentSlotMembers?.MORNING_5_7 || 0, capacity: 5 },
    { slot: "MORNING_7_9", label: "Morning 7-9", current: trainer.currentSlotMembers?.MORNING_7_9 || 0, capacity: 5 },
    { slot: "MORNING_9_11", label: "Morning 9-11", current: trainer.currentSlotMembers?.MORNING_9_11 || 0, capacity: 5 },
    { slot: "EVENING_5_7", label: "Evening 5-7", current: trainer.currentSlotMembers?.EVENING_5_7 || 0, capacity: 5 },
    { slot: "EVENING_7_9", label: "Evening 7-9", current: trainer.currentSlotMembers?.EVENING_7_9 || 0, capacity: 5 },
    { slot: "EVENING_9_11", label: "Evening 9-11", current: trainer.currentSlotMembers?.EVENING_9_11 || 0, capacity: 5 }
  ];

  return slots;
};

// GET ASSIGNED MEMBERS
exports.getAssignedMembers = async (userId) => {
  const trainer = await TrainerProfile.findOne({ userId });
  if (!trainer) throw new Error("Trainer profile not found");

  // Get all premium members assigned to this trainer
  const members = await MemberProfile.find({
    assignedTrainerId: trainer._id,
    plan: "PREMIUM",
    status: "ACTIVE"
  }).populate("userId", "name email");

  return members;
};

// CREATE DIET PLAN
exports.createDietPlan = async (trainerProfileId, data) => {
  // Verify member is assigned to this trainer
  const member = await MemberProfile.findOne({
    _id: data.memberId,
    assignedTrainerId: trainerProfileId,
    plan: "PREMIUM"
  });

  if (!member) {
    throw new Error("You can only create diet plans for your assigned PREMIUM members");
  }

  return await DietPlan.create({
    trainerId: trainerProfileId,
    ...data
  });
};