const TrainerProfile = require("../models/TrainerProfile");
const User = require("../models/User");
const MemberProfile = require("../models/MemberProfile");
const Payment = require("../models/Payment");
const bcrypt = require("bcryptjs");
const Inquiry = require("../models/Inquiry");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const adminService = require("../services/adminService");


// TIME SLOT CONFIGURATION (fixed for entire membership)
const TIME_SLOTS = {
  MORNING_5_7: { label: "Morning 5:00 AM - 7:00 AM", start: "05:00", end: "07:00", capacity: 5 },
  MORNING_7_9: { label: "Morning 7:00 AM - 9:00 AM", start: "07:00", end: "09:00", capacity: 5 },
  MORNING_9_11: { label: "Morning 9:00 AM - 11:00 AM", start: "09:00", end: "11:00", capacity: 5 },
  EVENING_5_7: { label: "Evening 5:00 PM - 7:00 PM", start: "17:00", end: "19:00", capacity: 5 },
  EVENING_7_9: { label: "Evening 7:00 PM - 9:00 PM", start: "19:00", end: "21:00", capacity: 5 },
  EVENING_9_11: { label: "Evening 9:00 PM - 11:00 PM", start: "21:00", end: "23:00", capacity: 5 }
};


// UPDATED: ASSIGN TRAINER TO PREMIUM MEMBER (with time slot for entire membership)

exports.assignTrainer = async (req, res, next) => {
  try {
    const { memberId, trainerId, timeSlot } = req.body;

    // Validate time slot
    if (!TIME_SLOTS[timeSlot]) {
      return res.status(400).json({
        message: "Invalid time slot. Please select from: MORNING_5_7, MORNING_7_9, MORNING_9_11, EVENING_5_7, EVENING_7_9, EVENING_9_11"
      });
    }

    // Check if member exists and is PREMIUM
    const member = await MemberProfile.findById(memberId);
    if (!member || member.plan !== "PREMIUM" || member.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Only ACTIVE PREMIUM members can be assigned a trainer"
      });
    }

    // Check if member already has an assigned trainer
    if (member.assignedTrainerId) {
      return res.status(400).json({
        message: "Member already has an assigned trainer"
      });
    }

    // Check if member already has a time slot
    if (member.timeSlot) {
      return res.status(400).json({
        message: "Member already has a time slot assigned"
      });
    }

    // Check trainer exists and is active
    const trainer = await TrainerProfile.findById(trainerId);
    if (!trainer || !trainer.activeStatus) {
      return res.status(404).json({
        message: "Trainer not found or inactive"
      });
    }

    // Check if trainer has capacity in this time slot
    const currentSlotMembers = trainer.currentSlotMembers?.[timeSlot] || 0;
    if (currentSlotMembers >= 5) {
      return res.status(400).json({
        message: `This time slot is full for this trainer. Maximum 5 members allowed in ${TIME_SLOTS[timeSlot].label}`
      });
    }

    // Update trainer - add member to their slot
    trainer.currentSlotMembers = trainer.currentSlotMembers || {};
    trainer.currentSlotMembers[timeSlot] = (trainer.currentSlotMembers[timeSlot] || 0) + 1;
    trainer.slotMembers = trainer.slotMembers || {};
    trainer.slotMembers[timeSlot] = trainer.slotMembers[timeSlot] || [];
    trainer.slotMembers[timeSlot].push(memberId);

    await trainer.save();

    // Update member - assign trainer and time slot
    member.assignedTrainerId = trainerId;
    member.timeSlot = timeSlot;
    await member.save();

    res.json({
      message: `Trainer assigned successfully for ${TIME_SLOTS[timeSlot].label} time slot`,
      member: {
        id: member._id,
        timeSlot: member.timeSlot,
        assignedTrainerId: member.assignedTrainerId
      },
      trainer: {
        id: trainer._id,
        name: trainer.userId?.name,
        currentSlotMembers: trainer.currentSlotMembers[timeSlot],
        capacity: 5
      }
    });

  } catch (error) {
    next(error);
  }
};


// GET AVAILABLE TIME SLOTS FOR A TRAINER

exports.getTrainerAvailableSlots = async (req, res, next) => {
  try {
    const { trainerId } = req.params;

    const trainer = await TrainerProfile.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Calculate availability for each time slot
    const availableSlots = Object.keys(TIME_SLOTS).map(slotKey => {
      const currentMembers = trainer.currentSlotMembers?.[slotKey] || 0;
      const availableSpots = 5 - currentMembers;

      return {
        value: slotKey,
        label: TIME_SLOTS[slotKey].label,
        startTime: TIME_SLOTS[slotKey].start,
        endTime: TIME_SLOTS[slotKey].end,
        currentMembers,
        availableSpots,
        isAvailable: availableSpots > 0,
        capacity: 5
      };
    });

    res.json({
      trainerId: trainer._id,
      trainerName: trainer.userId?.name,
      slots: availableSlots
    });

  } catch (error) {
    next(error);
  }
};


// GET ALL AVAILABLE SLOTS ACROSS ALL TRAINERS
exports.getAllAvailableSlots = async (req, res, next) => {
  try {
    const activeTrainers = await TrainerProfile.find({ activeStatus: true })
      .populate("userId", "name");

    // Initialize slot availability
    const slotAvailability = {};
    Object.keys(TIME_SLOTS).forEach(slot => {
      slotAvailability[slot] = {
        ...TIME_SLOTS[slot],
        totalCapacity: 0,
        currentMembers: 0,
        availableSpots: 0,
        trainers: []
      };
    });

    // Calculate totals across all trainers
    activeTrainers.forEach(trainer => {
      Object.keys(TIME_SLOTS).forEach(slot => {
        const membersInSlot = trainer.currentSlotMembers?.[slot] || 0;
        slotAvailability[slot].totalCapacity += 5;
        slotAvailability[slot].currentMembers += membersInSlot;

        if (membersInSlot < 5) {
          slotAvailability[slot].trainers.push({
            id: trainer._id,
            name: trainer.userId?.name,
            availableSpots: 5 - membersInSlot
          });
        }
      });
    });

    // Calculate available spots
    Object.keys(slotAvailability).forEach(slot => {
      slotAvailability[slot].availableSpots =
        slotAvailability[slot].totalCapacity - slotAvailability[slot].currentMembers;
    });

    res.json({
      slots: slotAvailability,
      totalTrainers: activeTrainers.length
    });

  } catch (error) {
    next(error);
  }
};


// REASSIGN MEMBER TO DIFFERENT TIME SLOT (or different trainer)

exports.reassignMemberSlot = async (req, res, next) => {
  try {
    const { memberId, newTimeSlot, trainerId: newTrainerId } = req.body;

    // Validate new time slot
    if (!TIME_SLOTS[newTimeSlot]) {
      return res.status(400).json({ message: "Invalid time slot" });
    }

    // Find member
    const member = await MemberProfile.findById(memberId);
    if (!member || member.plan !== "PREMIUM") {
      return res.status(404).json({ message: "Premium member not found" });
    }

    if (!member.assignedTrainerId) {
      return res.status(400).json({ message: "Member has no assigned trainer" });
    }

    const oldTimeSlot = member.timeSlot;
    const oldTrainerId = member.assignedTrainerId;

    // Determine if we are switching to a different trainer
    const isSwitchingTrainer = newTrainerId && newTrainerId.toString() !== oldTrainerId.toString();

    // Get old trainer
    const oldTrainer = await TrainerProfile.findById(oldTrainerId);
    if (!oldTrainer) {
      return res.status(404).json({ message: "Current trainer not found" });
    }

    // If switching trainer, validate and load new trainer
    let newTrainer = oldTrainer;
    if (isSwitchingTrainer) {
      newTrainer = await TrainerProfile.findById(newTrainerId);
      if (!newTrainer || !newTrainer.activeStatus) {
        return res.status(404).json({ message: "New trainer not found or inactive" });
      }
    }

    // Check capacity on the target trainer for the new slot
    const currentInNewSlot = newTrainer.currentSlotMembers?.[newTimeSlot] || 0;
    if (currentInNewSlot >= 5) {
      return res.status(400).json({
        message: `New time slot ${TIME_SLOTS[newTimeSlot].label} is full for the selected trainer`
      });
    }

    if (isSwitchingTrainer) {
      // --- Remove from old trainer's old slot ---
      if (oldTimeSlot) {
        oldTrainer.currentSlotMembers[oldTimeSlot] = Math.max(0, (oldTrainer.currentSlotMembers[oldTimeSlot] || 1) - 1);
        oldTrainer.slotMembers[oldTimeSlot] = (oldTrainer.slotMembers[oldTimeSlot] || [])
          .filter(id => id.toString() !== memberId.toString());
        oldTrainer.markModified('currentSlotMembers');
        oldTrainer.markModified('slotMembers');
        await oldTrainer.save();
      }

      // --- Add to new trainer's new slot ---
      newTrainer.currentSlotMembers[newTimeSlot] = (newTrainer.currentSlotMembers[newTimeSlot] || 0) + 1;
      newTrainer.slotMembers[newTimeSlot] = newTrainer.slotMembers[newTimeSlot] || [];
      newTrainer.slotMembers[newTimeSlot].push(memberId);
      newTrainer.markModified('currentSlotMembers');
      newTrainer.markModified('slotMembers');
      await newTrainer.save();
    } else {
      // Same trainer — just move between slots
      if (oldTimeSlot) {
        oldTrainer.currentSlotMembers[oldTimeSlot] = Math.max(0, (oldTrainer.currentSlotMembers[oldTimeSlot] || 1) - 1);
        oldTrainer.slotMembers[oldTimeSlot] = (oldTrainer.slotMembers[oldTimeSlot] || [])
          .filter(id => id.toString() !== memberId.toString());
      }
      oldTrainer.currentSlotMembers[newTimeSlot] = (oldTrainer.currentSlotMembers[newTimeSlot] || 0) + 1;
      oldTrainer.slotMembers[newTimeSlot] = oldTrainer.slotMembers[newTimeSlot] || [];
      oldTrainer.slotMembers[newTimeSlot].push(memberId);
      oldTrainer.markModified('currentSlotMembers');
      oldTrainer.markModified('slotMembers');
      await oldTrainer.save();
    }

    // Update member record
    member.timeSlot = newTimeSlot;
    if (isSwitchingTrainer) {
      member.assignedTrainerId = newTrainerId;
    }
    await member.save();

    res.json({
      message: `Member reassigned to ${TIME_SLOTS[newTimeSlot].label}${isSwitchingTrainer ? ' with new trainer' : ''}`,
      member: {
        id: member._id,
        timeSlot: member.timeSlot,
        trainerId: member.assignedTrainerId
      }
    });

  } catch (error) {
    next(error);
  }
};


// NEW: REMOVE MEMBER FROM TRAINER (when membership expires)

exports.removeMemberFromTrainer = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    const member = await MemberProfile.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (!member.assignedTrainerId || !member.timeSlot) {
      return res.status(400).json({ message: "Member has no trainer assigned" });
    }

    const trainerId = member.assignedTrainerId;
    const timeSlot = member.timeSlot;

    // Update trainer
    const trainer = await TrainerProfile.findById(trainerId);
    if (trainer) {
      trainer.currentSlotMembers[timeSlot] = (trainer.currentSlotMembers[timeSlot] || 1) - 1;
      trainer.slotMembers[timeSlot] = (trainer.slotMembers[timeSlot] || [])
        .filter(id => id.toString() !== memberId);
      await trainer.save();
    }

    // Update member
    member.assignedTrainerId = null;
    member.timeSlot = null;
    await member.save();

    res.json({
      message: "Member removed from trainer successfully",
      member
    });

  } catch (error) {
    next(error);
  }
};


// GET ALL INQUIRIES
exports.getAllInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    next(error);
  }
};

// RESPOND TO INQUIRY
exports.respondToInquiry = async (req, res, next) => {
  try {
    const { response } = req.body;
    const inquiry = await Inquiry.findById(req.params.inquiryId);

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    // Update inquiry
    inquiry.status = "replied";
    inquiry.response = response;
    inquiry.respondedAt = new Date();
    inquiry.respondedBy = req.user.id;
    await inquiry.save();

    // Send email response
    await sendEmail(
      inquiry.email,
      "Response to Your Inquiry - TITAN FIT",
      `Hello ${inquiry.name},\n\nThank you for reaching out to us. Here's our response:\n\n"${response}"\n\nIf you have any further questions, please don't hesitate to contact us.\n\nBest regards,\nTITAN FIT Team`
    );

    res.json({ message: "Response sent successfully", inquiry });
  } catch (error) {
    next(error);
  }
};

// SUBMIT INQUIRY 
exports.submitInquiry = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    const inquiry = await Inquiry.create({
      name,
      email,
      message
    });

    // Send confirmation email to user
    await sendEmail(
      email,
      "Inquiry Received - TITAN FIT",
      `Hello ${name},\n\nThank you for reaching out to us. We have received your message:\n\n"${message}"\n\nOur team will get back to you shortly.\n\nBest regards,\nTITAN FIT Team`
    );

    res.status(201).json({
      message: "Inquiry submitted successfully",
      inquiry
    });
  } catch (error) {
    next(error);
  }
};

// DELETE INQUIRY
exports.deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.inquiryId);

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    await Inquiry.findByIdAndDelete(req.params.inquiryId);

    res.json({
      message: "Inquiry deleted successfully",
      inquiryId: req.params.inquiryId
    });

  } catch (error) {
    next(error);
  }
};

// ADD TRAINER 
exports.addTrainer = async (req, res, next) => {
  try {
    const { name, email, specialization, experience } = req.body;

    const password = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "TRAINER",
      isVerified: true
    });

    // Initialize slot capacity fields
    const trainerProfile = await TrainerProfile.create({
      userId: user._id,
      specialization,
      experience,
      currentSlotMembers: {
        MORNING_5_7: 0,
        MORNING_7_9: 0,
        MORNING_9_11: 0,
        EVENING_5_7: 0,
        EVENING_7_9: 0,
        EVENING_9_11: 0
      },
      slotMembers: {
        MORNING_5_7: [],
        MORNING_7_9: [],
        MORNING_9_11: [],
        EVENING_5_7: [],
        EVENING_7_9: [],
        EVENING_9_11: []
      }
    });

    await sendEmail(email, "Trainer Account Created",
      `Your password is ${password}\n\nYou can now login to the trainer portal.`);

    res.status(201).json(trainerProfile);

  } catch (error) {
    next(error);
  }
};

// GET ALL TRAINERS 
exports.getAllTrainers = async (req, res, next) => {
  try {
    const trainers = await TrainerProfile.find()
      .populate("userId", "name email");

    // Enhance with slot information
    const enhancedTrainers = trainers.map(trainer => {
      const trainerObj = trainer.toObject();

      // Add slot summary
      trainerObj.slotSummary = Object.keys(TIME_SLOTS).map(slot => ({
        slot,
        label: TIME_SLOTS[slot].label,
        currentMembers: trainer.currentSlotMembers?.[slot] || 0,
        capacity: 5,
        availableSpots: 5 - (trainer.currentSlotMembers?.[slot] || 0)
      }));

      // Calculate total members
      trainerObj.totalAssignedMembers = Object.values(trainer.currentSlotMembers || {}).reduce((a, b) => a + b, 0);

      return trainerObj;
    });

    res.json(enhancedTrainers);
  } catch (error) {
    next(error);
  }
};

// UPDATE TRAINER
exports.updateTrainer = async (req, res, next) => {
  try {
    const { name, specialization, experience, activeStatus } = req.body;

    // Find the trainer profile first to get the linked userId
    const trainer = await TrainerProfile.findById(req.params.trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Update name on the User document if provided
    if (name && trainer.userId) {
      await User.findByIdAndUpdate(trainer.userId, { name });
    }

    // Build update object for TrainerProfile (only relevant fields)
    const profileUpdate = {};
    if (specialization !== undefined) profileUpdate.specialization = specialization;
    if (experience !== undefined) profileUpdate.experience = experience;
    if (activeStatus !== undefined) profileUpdate.activeStatus = activeStatus;

    const updated = await TrainerProfile.findByIdAndUpdate(
      req.params.trainerId,
      profileUpdate,
      { new: true }
    ).populate("userId", "name email");

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE TRAINER
exports.deleteTrainer = async (req, res, next) => {
  try {
    const trainer = await TrainerProfile.findById(req.params.trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Get all members assigned to this trainer
    const assignedMembers = await MemberProfile.find({
      assignedTrainerId: trainer._id
    });

    // Unassign all members
    for (const member of assignedMembers) {
      member.assignedTrainerId = null;
      member.timeSlot = null;
      await member.save();
    }

    // Delete trainer
    await TrainerProfile.findByIdAndDelete(req.params.trainerId);

    res.json({
      message: "Trainer removed successfully",
      unassignedMembers: assignedMembers.length
    });
  } catch (error) {
    next(error);
  }
};



// GET MEMBERS

exports.getAllMembers = async (req, res, next) => {
  try {
    const members = await MemberProfile.find()
      .populate("userId", "name email")
      .populate("assignedTrainerId", "userId specialization");

    // Enhance member info
    const enhancedMembers = members.map(member => {
      const memberObj = member.toObject();

      // Add slot label if timeSlot exists
      if (member.timeSlot && TIME_SLOTS[member.timeSlot]) {
        memberObj.timeSlotLabel = TIME_SLOTS[member.timeSlot].label;
      }

      return memberObj;
    });

    res.json(enhancedMembers);
  } catch (error) {
    next(error);
  }
};

// UPDATE MEMBER STATUS
exports.updateMemberStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const member = await MemberProfile.findById(req.params.memberId);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // If status is being set to EXPIRED, remove trainer assignment
    if (status === "EXPIRED" && member.assignedTrainerId) {
      const trainer = await TrainerProfile.findById(member.assignedTrainerId);
      if (trainer && member.timeSlot) {
        // Remove from trainer's slot
        trainer.currentSlotMembers[member.timeSlot] = (trainer.currentSlotMembers[member.timeSlot] || 1) - 1;
        trainer.slotMembers[member.timeSlot] = (trainer.slotMembers[member.timeSlot] || [])
          .filter(id => id.toString() !== member._id.toString());
        await trainer.save();
      }

      // Clear member's trainer assignment
      member.assignedTrainerId = null;
      member.timeSlot = null;
    }

    member.status = status;
    await member.save();

    res.json({
      message: "Member status updated successfully",
      member
    });
  } catch (error) {
    next(error);
  }
};


// UPDATED: DASHBOARD STATS

exports.dashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();

    // Add slot occupancy stats
    const trainers = await TrainerProfile.find();
    let totalPremiumMembers = 0;
    const slotOccupancy = {};

    Object.keys(TIME_SLOTS).forEach(slot => {
      slotOccupancy[slot] = {
        label: TIME_SLOTS[slot].label,
        totalMembers: 0,
        totalCapacity: trainers.length * 5,
        trainers: []
      };
    });

    trainers.forEach(trainer => {
      Object.keys(TIME_SLOTS).forEach(slot => {
        const membersInSlot = trainer.currentSlotMembers?.[slot] || 0;
        slotOccupancy[slot].totalMembers += membersInSlot;
        totalPremiumMembers += membersInSlot;
      });
    });

    // Calculate occupancy percentages
    Object.keys(slotOccupancy).forEach(slot => {
      slotOccupancy[slot].occupancyPercentage =
        (slotOccupancy[slot].totalMembers / slotOccupancy[slot].totalCapacity) * 100;
      slotOccupancy[slot].availableSpots =
        slotOccupancy[slot].totalCapacity - slotOccupancy[slot].totalMembers;
    });

    res.json({
      ...stats,
      premiumMembers: totalPremiumMembers,
      slotOccupancy,
      timeSlots: TIME_SLOTS
    });
  } catch (error) {
    next(error);
  }
};