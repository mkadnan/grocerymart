const express = require("express");
const router = express.Router();
const otpController = require("../controllers/otpController");

// Route to request OTP
router.post("/request-otp", otpController.requestOtp);

// Route to verify OTP
router.post("/verify-otp", otpController.verifyOtp);

module.exports = router;