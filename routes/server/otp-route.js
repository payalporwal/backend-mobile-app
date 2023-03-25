const router = require('express').Router();
const bcrypt = require('bcryptjs');
require('dotenv').config();

const HttpError = require('../../utils/http-error');
const OTPmodel = require('../../models/otp');
const User = require('../../models/user');
const sendmail = require('../../utils/email/send');


function otpfunc() {
    otplist = []

    for( let i=0; i<6; i++){
        otplist.push(Math.floor(Math.random() * 9)+1);
    }
    let shuffled = otplist
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
    
    const otp = shuffled.reduce((accum, digit) => (accum * 10) + digit, 0);
    return otp;
}

router.post('/sendOtp', async (req, res, next) => {
    try{
        
        const {email, type} = req.body;
        if(!email && !type) {
            return next(new HttpError('Invalid inputs passed, Recheck', false, 422));
        }
        const user = await User.findOne({email: email});
        //checking for user to send otp for login or other
        if(!user){
            return next(new HttpError('No user found, Register instead!', false, 404));
        }
        
        //generating otp
        const OTP = otpfunc();

        console.log(OTP);

        //hashing otp for security
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedotp = await bcrypt.hash(String(OTP), salt);
        
        //saving to db

        await new OTPmodel({ otp: hashedotp, email: email, otptype: type}).save();
        console.log('saved');

        //send email as per need

        if(type=="Register"){
            const {message, subject_mail} = require('../../utils/email/register-mail');
            email_message=message(OTP, user.username)
            email_subject=subject_mail
        }
        else if(type=="Reset Password"){
            const {message, subject_mail} = require('../../utils/email/reset-mail');
            email_message=message(OTP, user.username)
            email_subject=subject_mail
        }
        else{
            return next(new HttpError('Invalid Request!', false, 400));
        }

        await sendmail(email_message, email_subject, email);

        res.status(201).json({
            message: 'OTP sent on Email!',
            success: true
        });

    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
});

router.post('/verifyOtp', async (req, res, next) =>{
    try{
        //check for inputs
        const {email, OTP, type} = req.body;

        if(!email && !OTP && !type) {
            return next(new HttpError('Invalid inputs passed, Recheck', false, 422));
        }
        //verifying user for valid otp
        const otpdata = await OTPmodel.findOne({email: email});
        if(!otpdata){
            return next(new HttpError('OTP Expired, Please Retry', false, 404));
        }

        //verify type
        
        //comparing otp
        const valid = await bcrypt.compare(String(OTP), otpdata.otp);
        if(!valid) {
            await otpdata.remove();
            return next(new HttpError('Invalid OTP!, Try Again', false, 400));
        }

        //validate for email and otp
        if(email === otpdata.email && type === otpdata.otptype){
            if(type === "Register" && otpdata.otptype === "Register"){
                const user =  await User.findOne({email:email});
                user.otpverify = true;
                await user.save();  
            }
            await otpdata.remove();
            res.status(200).json({
                message: 'OTP Verification Successful!',
                success: true
            });
        } else {
            return next(new HttpError('Invalid Request!, Try Again', false, 400));
        }

    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, try again!', false, 500));
    }
});

module.exports = router;