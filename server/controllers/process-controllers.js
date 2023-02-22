const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const config =  require('../../config.js');

const UserToken = require('../models/token');
const HttpError = require('../../utils/http-error');
const User = require('../models/user');
const supports = require('../models/support');
const feedbacks = require('../models/feedback');


require('dotenv').config();

var current = new Date();
const timeStamp = new Date(Date.UTC(current.getFullYear(), 
    current.getMonth(),current.getDate(),current.getHours(), 
    current.getMinutes(),current.getSeconds(), current.getMilliseconds())
);

//access data apis
exports.getUserbyId = async (req, res, next) => {
    try{
        const user = await User.findById(req.userData.userId);
    
        if(!user) {
            const error = new HttpError(
                'No valid user found, Try Again',
                false,
                404
            );
            
            return next(error);
        }
        res.status(200).json({
            message: `Access as ${user.username}`,
            success: true,
            profile: user.profile,
            id: user.id,
            name: user.username,
            email: user.email,
            phone: user.phone,
            age: user.age,
            gender: user.gender,
            verified: user.verified,
            slideno: user.slideno,
            docComplete: user.completedDoc
        });
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, Try Again!',
            false,
            500
        );
        return next(error);
    }
};

exports.getUserbyEmail = async (req, res, next) => {
    try{
        const user = await User.findOne({ email: `${req.userData.email}` });
        if(!user) {
            const error = new HttpError(
                'No valid user found, Try Again',
                false,
                404
            );
            return next(error);
        }
        res.status(200).json({
            message: `Access as ${user.username}`,
            success: true,
            id: user.id,
            name: user.username,
            email: user.email,
            phone: user.phone,
            age: user.age,
            gender: user.gender,
            verified: user.verified,
            slideno: user.slideno,
            docComplete: user.completedDoc
        });
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, Try Again!',
            false,
            500
        );
        return next(error);
    }
};

//updation apis 
exports.updateSlide = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, Recheck', false, 422)
        );
        }

        const user = await User.findById(req.userData.userId);
        user.slideno = req.body.slideno;
        user.completedDoc = req.body.completedDoc;
        await user.save();
        res.status(200).json({
            message: 'Updated Slide',
            success: true
        });
    } catch (err) {
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

exports.updateUser = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, Recheck', false, 422)
        );
        }

        const { username, phone, age, gender } = req.body;
        const userId = req.userData.userId;

        const userphone = await User.findOne({phone: phone});
        if(userphone){
        if(userphone.id !== userId){
            return next(
                new HttpError('Phone number exists, try another', false, 422)
            );
        }}

        const user = await User.findById(userId);
        if(!user) {
            const error = new HttpError(
                'No valid user found, Try Again',
                false,
                404
            );
            return next(error);
        }
        user.profile = `https://${config.HOST}:${config.PORT}/`+ req.file.path;
        user.username = username;
        user.phone = phone;
        user.age = age;
        user.gender = gender;
        user.updatedAt = timeStamp;

        await user.save();

        res.status(200).json({message: 'Updation Complete', success: true});
    } catch (err) {
        console.log(err);
        const error = new HttpError(
        'Something went wrong, Try Again', false,
        500
        );
        return next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try{
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return next(
                new HttpError('Invalid inputs passed, Recheck', false, 422)
            );
        }

        const {oldpassword, newpassword} = req.body;
        const userId = req.userData.userId;
        const user = await User.findById(userId);

        let isValidPassword = false;
        try{
            isValidPassword = await bcrypt.compare(oldpassword, user.password);
        } catch (err) {
            console.log(err);
            const error = new HttpError(
            'Password not changed, Retry!',
            false,
            500
            );
            return next(error);
        }
    
        if (!isValidPassword) {
            const error = new HttpError(
            'Wrong credentials, check password',
            false,
            403
            );
            return next(error);
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(newpassword, salt);

        user.password = hashedPassword;
        user.updatedAt = timeStamp;
        await user.save();

        res.status(200).json({message: 'Password changes successful!', success: true});
    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

//delete profile 
exports.deleteUser = async (req, res, next) => {
    try{
        await User.findByIdAndUpdate(req.userData.userId, {active: false});
        await UserToken.findOneAndDelete({userId: req.userData.userId});
        res.status(200).json({message: 'Account Deletion Successful', success: true});
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Couldn\'t Delete!', false, 500));
    }
};

//support and feedback apis
exports.supportRequest = async (req, res, next) =>{
    try{
        const { text } = req.body;
        if(!text) {
            return next(HttpError('Write Something and try again', false, 400));
        }
        const user = await User.findById(req.userData.userId);
        await new supports({userId: user.id, username: user.username, email: user.email, text: text }).save();
        res.status(201).json({message: 'Request sent, Will get back to you soon', success: true});
    } catch (err){
        return next( new HttpError('Couldn\'t complete request, Send Again'), false, 500);
    }
    
};

exports.feedback = async (req, res, next) =>{
    try{
        const { text, rating } = req.body;
        if(!text && !rating) {
            return next(HttpError('Write Something and try again', false, 400));
        }
        const user = await User.findById(req.userData.userId);
        await new feedbacks({username: user.username, age: user.age, gender: user.gender, email: user.email, text: text, rating: rating}).save();
        res.status(201).json({message: 'Thankyou for your feeback, it is valuable for us!', success: true});
    } catch (err){
        return next( new HttpError('Couldn\'t complete request, Send Again'), false, 500);
    }
    
};

exports.uploaddocs = async (req, res, next) => {
    try{
        const user = await User.findById(req.userData.userId);
        if(!user) {
            const error = new HttpError(
                'No valid user found, Try Again',
                false,
                404
            );
            return next(error);
        }
        user.verifydoc = `https://${config.HOST}:${config.PORT}/`+ req.file.path;
        await user.save();
        res.json({message: `Uploaded Successfully `, success: true, doc: user.verifydoc});
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Couldn\'t upload!', false, 500));
    }
};