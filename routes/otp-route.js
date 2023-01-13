const express = require('express');
const { check } = require('express-validator');

const otpControllers = require('../controllers/otp-controllers');
const router = express.Router();

router.post('/sendOtp', [
    check('email').normalizeEmail().isEmail(), 
    check('type').notEmpty(), 
], otpControllers.generateOTP);

router.post('/verifyOtp', [
    check('email').normalizeEmail().isEmail(), 
    check('OTP').isLength({min:6}),
    check('type').notEmpty(), 
], otpControllers.verifyOtp);

module.exports = router;