const mongoose = require("mongoose");

const memberProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  plan: {
    type: String,
    enum: ["SIMPLE", "PREMIUM"]
  },
  status: {
    type: String,
    enum: ["ACTIVE", "EXPIRED"],
    default: "EXPIRED"
  },
  startDate: Date,
  endDate: Date,
  timeSlot: {
    type: String,
    enum: [
      "MORNING_5_7",
      "MORNING_7_9", 
      "MORNING_9_11",
      "EVENING_5_7",
      "EVENING_7_9",
      "EVENING_9_11"
    ]
  },
  assignedTrainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TrainerProfile"
  },
  // Profile photo
  profilePhoto: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' }
  },
  phone: { type: String, default: '' },
  age: { type: Number, default: null },
  gender: { 
    type: String, 
    enum: ['', 'MALE', 'FEMALE', 'OTHER'],
    default: '' 
  },
  height: { type: Number, default: null },
  weight: { type: Number, default: null },
  fitnessGoal: { 
    type: String, 
    enum: ['', 'WEIGHT_LOSS', 'MUSCLE_GAIN', 'STRENGTH', 'ENDURANCE', 'FLEXIBILITY', 'GENERAL_FITNESS'],
    default: '' 
  }
});

module.exports = mongoose.model("MemberProfile", memberProfileSchema);