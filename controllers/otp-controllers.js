const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const HttpError = require('../utils/http-error');
const OTPmodel = require('../models/otp');
const User = require('../models/user');
const otp = require('../models/otp');

const generateOTP = async (req, res, next) => {
    try{
        const {email, type} = req.body;
        if((!email || !type)) {
            return next(new HttpError('Please provide correct input', false, 422));
        }
        const user = await User.findOne({email: email});
        //checking for user to send otp for login or other
        if(!user){
            return next(new HttpError('Please register user, Try Again!', false, 404));
        }
        
        //generating otp
        const OTP = Math.floor(Math.random() * 9000) + 1000;
        console.log(OTP);

        //hashing otp for security
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedotp = await bcrypt.hash(String(OTP), salt);
        
        //saving to db

        await new OTPmodel({userId: user.id, otp: hashedotp, email: email, otptype: type}).save();
        console.log('saved');

        //send email as per need
        if(type){
            if(type=="Register"){
              const {message, subject_mail} = require('../utils/email/register-mail');
              email_message=message(OTP, user.username)
              email_subject=subject_mail
            }
            else if(type=="Reset Password"){
              const {message, subject_mail} = require('../utils/email/reset-mail');
              email_message=message(OTP, user.username)
              email_subject=subject_mail
            }
            else{
              return next(new HttpError('Invalid Request', false, 400));
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
            from: `"Pace Support"<${process.env.EMAIL_ADDRESS}>`,
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
            message: 'OTP sent successfully',
            success: true
        });

    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

const verifyOtp = async (req, res, next) =>{
    try{
        //check for inputs
        const {email, OTP, type} = req.body;
        if((!email || !OTP || !type)) {
            return next(new HttpError('Please provide correct input', false, 422));
        }

        //verifying user for valid otp
        const otpdata = await OTPmodel.findOne({email: email});
        if(!otpdata){
            return next(new HttpError('OTP Expired, Please Retry', false, 404));
        }

        //verify type
        
        
        //comparing otp
        const valid = await bcrypt.compare(String(OTP), otpdata.otp);

        //validate for email and otp
        if(email === otpdata.email && valid && type === otpdata.otptype){
            await otpdata.remove();
            res.status(200).json({
                message: 'OTP Verified',
                success: true
            });
        } else {
            return next(new HttpError('Invalid Request', false, 400));
        }

    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, try again', false, 500));
    }
};

exports.generateOTP = generateOTP;
exports.verifyOtp = verifyOtp;
