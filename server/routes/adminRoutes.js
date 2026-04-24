const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware("ADMIN"));

// Trainer
router.post("/trainers", adminController.addTrainer);
router.get("/trainers", adminController.getAllTrainers);
router.put("/trainers/:trainerId", adminController.updateTrainer);
router.delete("/trainers/:trainerId", adminController.deleteTrainer);
router.get("/trainers/:trainerId/available-slots", adminController.getTrainerAvailableSlots);
router.get("/available-slots", adminController.getAllAvailableSlots);

// Member
router.post("/assign-trainer", adminController.assignTrainer);
router.post("/reassign-slot", adminController.reassignMemberSlot);
router.delete("/members/:memberId/remove-trainer", adminController.removeMemberFromTrainer);
router.get("/members", adminController.getAllMembers);
router.put("/members/:memberId/status", adminController.updateMemberStatus);


// Admin
router.get("/dashboard", adminController.dashboard);

// Inquiry routes
router.get("/inquiries", adminController.getAllInquiries);
router.post("/inquiries/:inquiryId/respond", adminController.respondToInquiry);
router.delete("/inquiries/:inquiryId", adminController.deleteInquiry);

module.exports = router;