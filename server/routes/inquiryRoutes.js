const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.post("/submit", adminController.submitInquiry);

module.exports = router;