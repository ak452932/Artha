const express = require("express");
const router = express.Router();
const controller = require("../Controllers/AdminController");
const jobController = require("../Controllers/jobController");


router.post("/signup", controller.signupUser);
router.post("/verify-otp", controller.verifyOtp);
router.post("/login", controller.loginUser);

// Team Member Routes
router.post("/add-team-member", controller.addTeamMember);
router.get("/team-members", controller.getTeamMembers);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);


router.get('/fetch', jobController.fetchJobs);   // Fetch & update jobs

router.get("/job", jobController.getJobs); // Get all jobs
//router.get('/all', jobController.getAllJobs); 


module.exports = router;