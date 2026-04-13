const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware("ADMIN"));

// Trainer Management
router.post("/trainers", adminController.addTrainer);
router.get("/trainers", adminController.getAllTrainers);
router.put("/trainers/:trainerId", adminController.updateTrainer);
router.delete("/trainers/:trainerId", adminController.deleteTrainer);

// NEW: Get trainer available slots
router.get("/trainers/:trainerId/available-slots", adminController.getTrainerAvailableSlots);

// NEW: Get all available slots across trainers
router.get("/available-slots", adminController.getAllAvailableSlots);

// Member Assignment (UPDATED)
router.post("/assign-trainer", adminController.assignTrainer);
router.post("/reassign-slot", adminController.reassignMemberSlot);
router.delete("/members/:memberId/remove-trainer", adminController.removeMemberFromTrainer);

// Members
router.get("/members", adminController.getAllMembers);
router.put("/members/:memberId/status", adminController.updateMemberStatus);


// Dashboard
router.get("/dashboard", adminController.dashboard);

// Inquiry routes (keep as is)
router.get("/inquiries", adminController.getAllInquiries);
router.post("/inquiries/:inquiryId/respond", adminController.respondToInquiry);
// Add this with your other inquiry routes
router.delete("/inquiries/:inquiryId", adminController.deleteInquiry);

module.exports = router;