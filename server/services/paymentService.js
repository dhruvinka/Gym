const MemberProfile = require("../models/MemberProfile");
const SubscriptionPlan = require("../models/SubscriptionPlan");

exports.activateOrRenewMembership = async (userId, planId) => {

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new Error("Plan not found");

  const existing = await MemberProfile.findOne({ userId });

  const now = new Date();

  let startDate = now;

  if (existing && existing.membershipEnd > now) {
    startDate = existing.membershipEnd;
  }

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + plan.durationInDays);

  const updatedProfile = await MemberProfile.findOneAndUpdate(
    { userId },
    {
      subscriptionType: plan.name.toUpperCase(),
      membershipStart: startDate,
      membershipEnd: endDate,
      status: "ACTIVE"
    },
    { upsert: true, new: true }
  );

  return updatedProfile;
};
