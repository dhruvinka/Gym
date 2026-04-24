const express = require("express");
const router = express.Router();

const trainerController = require("../controllers/trainerController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");


router.use(authMiddleware, roleMiddleware("TRAINER"));

router.get("/profile", trainerController.getProfile);
router.put("/profile", trainerController.updateProfile);
router.get("/schedules", trainerController.getSchedules);
router.get("/members", trainerController.getMembers);
router.post("/diet-plan", trainerController.createDietPlan);
router.put("/diet-plan/:dietPlanId", trainerController.updateDietPlan);
router.delete("/diet-plan/:dietPlanId", trainerController.deleteDietPlan);
router.get("/diet-plans", trainerController.getMyDietPlans);


module.exports = router;