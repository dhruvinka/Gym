const express = require("express");
const router = express.Router();
const photoController = require("../controllers/photoController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");
const { uploadMemberPhoto, uploadTrainerPhoto } = require("../config/cloudinary");

// Member photo routes
router.post(
  "/member/upload",
  authMiddleware,
  roleMiddleware("MEMBER"),
  uploadMemberPhoto.single('photo'),
  photoController.uploadMemberPhoto
);

router.delete(
  "/member/delete",
  authMiddleware,
  roleMiddleware("MEMBER"),
  photoController.deleteMemberPhoto
);

// Trainer photo routes
router.post(
  "/trainer/upload",
  authMiddleware,
  roleMiddleware("TRAINER"),
  uploadTrainerPhoto.single('photo'),
  photoController.uploadTrainerPhoto
);

router.delete(
  "/trainer/delete",
  authMiddleware,
  roleMiddleware("TRAINER"),
  photoController.deleteTrainerPhoto
);

module.exports = router;