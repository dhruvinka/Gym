const express = require("express");
const router = express.Router();

const trainerController = require("../controllers/trainerController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");


router.use(authMiddleware, roleMiddleware("TRAINER"));

// Profile routes
router.get("/profile", trainerController.getProfile);
router.put("/profile", trainerController.updateProfile);

// Schedule routes (UPDATED - now shows slots)
router.get("/schedules", trainerController.getSchedules);

// Members routes (UPDATED - now shows premium members only)
router.get("/members", trainerController.getMembers);
// Diet plan routes
router.post("/diet-plan", trainerController.createDietPlan);
router.put("/diet-plan/:dietPlanId", trainerController.updateDietPlan);
router.delete("/diet-plan/:dietPlanId", trainerController.deleteDietPlan);
router.get("/diet-plans", trainerController.getMyDietPlans);


module.exports = router;