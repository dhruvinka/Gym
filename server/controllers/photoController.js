const MemberProfile = require("../models/MemberProfile");
const TrainerProfile = require("../models/TrainerProfile");
const { cloudinary } = require("../config/cloudinary");

// Upload member profile photo
exports.uploadMemberPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const member = await MemberProfile.findOne({ userId: req.user.id });
    
    if (!member) {
      return res.status(404).json({ message: "Member profile not found" });
    }

    // Delete old photo if exists
    if (member.profilePhoto?.publicId) {
      await cloudinary.uploader.destroy(member.profilePhoto.publicId);
    }

    // Update with new photo
    member.profilePhoto = {
      url: req.file.path,
      publicId: req.file.filename
    };
    await member.save();

    res.json({
      message: "Profile photo uploaded successfully",
      profilePhoto: member.profilePhoto
    });

  } catch (error) {
    next(error);
  }
};

// Upload trainer profile photo
exports.uploadTrainerPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const trainer = await TrainerProfile.findOne({ userId: req.user.id });
    
    if (!trainer) {
      return res.status(404).json({ message: "Trainer profile not found" });
    }

    // Delete old photo if exists
    if (trainer.profilePhoto?.publicId) {
      await cloudinary.uploader.destroy(trainer.profilePhoto.publicId);
    }

    // Update with new photo
    trainer.profilePhoto = {
      url: req.file.path,
      publicId: req.file.filename
    };
    await trainer.save();

    res.json({
      message: "Profile photo uploaded successfully",
      profilePhoto: trainer.profilePhoto
    });

  } catch (error) {
    next(error);
  }
};

// Delete member profile photo
exports.deleteMemberPhoto = async (req, res, next) => {
  try {
    const member = await MemberProfile.findOne({ userId: req.user.id });
    
    if (!member) {
      return res.status(404).json({ message: "Member profile not found" });
    }

    if (member.profilePhoto?.publicId) {
      await cloudinary.uploader.destroy(member.profilePhoto.publicId);
      
      member.profilePhoto = { url: '', publicId: '' };
      await member.save();
    }

    res.json({ message: "Profile photo deleted successfully" });

  } catch (error) {
    next(error);
  }
};

// Delete trainer profile photo
exports.deleteTrainerPhoto = async (req, res, next) => {
  try {
    const trainer = await TrainerProfile.findOne({ userId: req.user.id });
    
    if (!trainer) {
      return res.status(404).json({ message: "Trainer profile not found" });
    }

    if (trainer.profilePhoto?.publicId) {
      await cloudinary.uploader.destroy(trainer.profilePhoto.publicId);
      
      trainer.profilePhoto = { url: '', publicId: '' };
      await trainer.save();
    }

    res.json({ message: "Profile photo deleted successfully" });

  } catch (error) {
    next(error);
  }
};