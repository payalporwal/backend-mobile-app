const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
require('dotenv').config();

const HttpError = require('../../utils/http-error');
const OTPmodel = require('../models/otp');
const User = require('../models/user');

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

const generateOTP = async (req, res, next) => {
    try{
        const errors = validationResult(req);
          if (!errors.isEmpty()) {
          return next(
              new HttpError('Invalid inputs passed, Recheck', false, 422)
          );
        }
        const {email, type} = req.body;
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
        if(type){
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
          }
        
        //connection to send mails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: true,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD
            },

        });

        //set email
        const mailOptions = {
            from: `"No-Reply PACE"<${process.env.EMAIL_ADDRESS}>`,
            to: `${email}`,
            subject: email_subject,
            text: email_message ,
          };
      
        await transporter.verify();

        //send mail
        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                return next(new HttpError('Something went wrong, Try Again', false, 500));
            } else {
                console.log("Server is ready to take our messages");
            }
        });
        res.status(201).json({
            message: 'OTP sent on Email!',
            success: true
        });

    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

const verifyOtp = async (req, res, next) =>{
    try{
        const errors = validationResult(req);
          if (!errors.isEmpty()) {
          return next(
              new HttpError('Invalid inputs passed, Recheck', false, 422)
          );
        }
        //check for inputs
        const {email, OTP, type} = req.body;

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
};

exports.generateOTP = generateOTP;
exports.verifyOtp = verifyOtp;
