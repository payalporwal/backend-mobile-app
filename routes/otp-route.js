const express = require('express');
const otpControllers = require('../controllers/otp-controllers');
const router = express.Router();

router.post('/sendOtp', otpControllers.generateOTP);

router.post('/verifyOtp', otpControllers.verifyOtp);

module.exports = router;