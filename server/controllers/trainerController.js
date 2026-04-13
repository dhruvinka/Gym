const trainerService = require("../services/trainerService");
const DietPlan = require("../models/DietPlan");
const TrainerProfile = require("../models/TrainerProfile");
const MemberProfile = require("../models/MemberProfile");



// GET PROFILE
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await trainerService.getTrainerProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await trainerService.updateTrainerProfile(
      req.user.id,
      req.body
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// GET MY SCHEDULES
exports.getSchedules = async (req, res, next) => {
  try {
    const schedules = await trainerService.getTrainerSchedules(req.user.id);
    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

// GET MY MEMBERS
exports.getMembers = async (req, res, next) => {
  try {
    const members = await trainerService.getAssignedMembers(req.user.id);
    res.json(members);
  } catch (error) {
    next(error);
  }
};

// CREATE DIET PLAN
exports.createDietPlan = async (req, res, next) => {
  try {
    const trainerProfile = await TrainerProfile.findOne({
      userId: req.user.id
    });

    if (!trainerProfile) {
      return res.status(404).json({
        message: "Trainer profile not found"
      });
    }

    const dietPlan = await trainerService.createDietPlan(
      trainerProfile._id,
      req.body
    );

    res.status(201).json(dietPlan);

  } catch (error) {
    next(error);
  }
};


// UPDATE DIET PLAN
exports.updateDietPlan = async (req, res, next) => {
  try {
    const updated = await DietPlan.findByIdAndUpdate(
      req.params.dietPlanId,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE DIET PLAN
exports.deleteDietPlan = async (req, res, next) => {
  try {
    await DietPlan.findByIdAndDelete(req.params.dietPlanId);

    res.json({ message: "Diet plan deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// VIEW MY DIET PLANS
exports.getMyDietPlans = async (req, res, next) => {
  try {
    const trainer = await TrainerProfile.findOne({
      userId: req.user.id
    });

    if (!trainer) {
      return res.status(404).json({ message: "Trainer profile not found" });
    }

    const plans = await DietPlan.find({
      trainerId: trainer._id
    }).populate("memberId");

    res.json(plans);
  } catch (error) {
    next(error);
  }
};
