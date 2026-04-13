const mongoose = require("mongoose");
const dietPlanSchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TrainerProfile",
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MemberProfile",
    required: true
  },
  week: {
    type: Number,
    required: true
  },
  meals: [
    {
      mealTime: String,
      items: [String]
    }
  ]
});
module.exports = mongoose.model("DietPlan", dietPlanSchema);
