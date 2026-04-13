const express = require("express");
const router = express.Router();
const TrainerProfile = require("../models/TrainerProfile");

// Public endpoint to get all active trainers
router.get("/trainers", async (req, res, next) => {
  try {
    const trainers = await TrainerProfile.find({ activeStatus: true })
      .populate("userId", "name email")
      .select("specialization experience");
    
    res.json(trainers);
  } catch (error) {
    next(error);
  }
});

module.exports = router;