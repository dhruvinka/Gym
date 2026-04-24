const express = require("express");
const router = express.Router();
const TrainerProfile = require("../models/TrainerProfile");

router.get("/trainers", async (req, res, next) => {
  try {
    const trainers = await TrainerProfile.find({ activeStatus: true })
      .populate("userId", "name email")
      .select("specialization experience profilePhoto bio");

    res.json(trainers);
  } catch (error) {
    next(error);
  }
});

module.exports = router;