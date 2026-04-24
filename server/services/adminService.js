const TrainerProfile = require("../models/TrainerProfile");
const MemberProfile = require("../models/MemberProfile");
const User = require("../models/User");
const Payment = require("../models/Payment");

exports.addTrainer = async (data) => {
  return await TrainerProfile.create(data);
};

exports.getDashboardStats = async () => {
  const totalMembers = await MemberProfile.countDocuments();
  const activeMembers = await MemberProfile.countDocuments({ status: "ACTIVE" });
  const expiredMembers = await MemberProfile.countDocuments({ status: "EXPIRED" });

  // Premium vs Simple members
  const premiumMembers = await MemberProfile.countDocuments({ plan: "PREMIUM" });
  const simpleMembers = await MemberProfile.countDocuments({ plan: "SIMPLE" });

  const totalTrainers = await TrainerProfile.countDocuments();
  const activeTrainers = await TrainerProfile.countDocuments({ activeStatus: true });

  const totalPayments = await Payment.countDocuments({ status: "SUCCESS" });
  const totalSchedules = 6;

  // Revenue calculation
  const revenueData = await Payment.aggregate([
    { $match: { status: "SUCCESS" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" }
      }
    }
  ]);

  const totalRevenue = revenueData.length > 0
    ? revenueData[0].totalRevenue / 100
    : 0;


  const trainers = await TrainerProfile.find();
  const slotStats = {
    MORNING_5_7: { current: 0, capacity: trainers.length * 5 },
    MORNING_7_9: { current: 0, capacity: trainers.length * 5 },
    MORNING_9_11: { current: 0, capacity: trainers.length * 5 },
    EVENING_5_7: { current: 0, capacity: trainers.length * 5 },
    EVENING_7_9: { current: 0, capacity: trainers.length * 5 },
    EVENING_9_11: { current: 0, capacity: trainers.length * 5 }
  };

  trainers.forEach(trainer => {
    if (trainer.currentSlotMembers) {
      Object.keys(slotStats).forEach(slot => {
        slotStats[slot].current += trainer.currentSlotMembers[slot] || 0;
      });
    }
  });

  // Calculate occupancy percentages
  Object.keys(slotStats).forEach(slot => {
    slotStats[slot].available = slotStats[slot].capacity - slotStats[slot].current;
    slotStats[slot].occupancyPercentage =
      (slotStats[slot].current / slotStats[slot].capacity) * 100 || 0;
  });

  return {
    totalMembers,
    activeMembers,
    expiredMembers,
    premiumMembers,
    simpleMembers,
    totalTrainers,
    activeTrainers,
    totalPayments,
    totalSchedules,
    totalRevenue,
    slotOccupancy: slotStats
  };
}; 