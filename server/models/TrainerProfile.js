const mongoose = require("mongoose");

const trainerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    specialization: String,
    experience: Number,
    activeStatus: {
      type: Boolean,
      default: true
    },
    profilePhoto: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    },
    bio: { type: String, default: '' },
    currentSlotMembers: {
      MORNING_5_7: { type: Number, default: 0 },
      MORNING_7_9: { type: Number, default: 0 },
      MORNING_9_11: { type: Number, default: 0 },
      EVENING_5_7: { type: Number, default: 0 },
      EVENING_7_9: { type: Number, default: 0 },
      EVENING_9_11: { type: Number, default: 0 }
    },
    slotMembers: {
      MORNING_5_7: [{ type: mongoose.Schema.Types.ObjectId, ref: "MemberProfile" }],
      MORNING_7_9: [{ type: mongoose.Schema.Types.ObjectId, ref: "MemberProfile" }],
      MORNING_9_11: [{ type: mongoose.Schema.Types.ObjectId, ref: "MemberProfile" }],
      EVENING_5_7: [{ type: mongoose.Schema.Types.ObjectId, ref: "MemberProfile" }],
      EVENING_7_9: [{ type: mongoose.Schema.Types.ObjectId, ref: "MemberProfile" }],
      EVENING_9_11: [{ type: mongoose.Schema.Types.ObjectId, ref: "MemberProfile" }]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainerProfile", trainerProfileSchema);