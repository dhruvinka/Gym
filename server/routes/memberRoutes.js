const express = require("express");
const router = express.Router();

const memberController = require("../controllers/memberController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware("MEMBER"));

router.get("/profile", memberController.getProfile);
router.put("/profile", memberController.updateProfile);
router.get("/subscription", memberController.getSubscription);
router.get("/my-trainer", memberController.getMyTrainer);
router.get("/diet-plan", memberController.getDietPlan);
router.get("/my-schedule", memberController.getMySchedule);

module.exports = router;