const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const UserToken = require('../models/token');
const HttpError = require('../utils/http-error');
const User = require('../models/user');
const UserAppResponse = require('../models/support');


require('dotenv').config();

var current = new Date();
const timeStamp = new Date(Date.UTC(current.getFullYear(), 
    current.getMonth(),current.getDate(),current.getHours(), 
    current.getMinutes(),current.getSeconds(), current.getMilliseconds())
);

//access data apis
const getUserbyId = async (req, res, next) => {
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
            id: user.id,
            name: user.username,
            email: user.email,
            phone: user.phone,
            age: user.age,
            gender: user.gender,
            slideno: user.slideno
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

const getUserbyEmail = async (req, res, next) => {
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
            slideno: user.slideno
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
const updateSlide = async (req, res, next) => {
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

const updateUser = async (req, res, next) => {
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

const changePassword = async (req, res, next) => {
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
const deleteUser = async (req, res, next) => {
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
const supportRequest = async (req, res, next) =>{
    try{
        const {text, type} = req.body;
        if(!text) {
            return next(HttpError('Write Something and try again', false, 400));
        }
        await new UserAppResponse({userId: req.userData.userId, email: req.userData.email, content: text, responsetype: type}).save();
        res.status(201).json({message: 'Request sent, Will get back to you soon', success: true});
    } catch (err){
        return next( new HttpError('Couldn\'t complete request, Send Again'), false, 500);
    }
    
};

const feedback = async (req, res, next) =>{
    try{
        const {text, type} = req.body;
        if(!text) {
            return next(HttpError('Write Something and try again', false, 400));
        }
        await new UserAppResponse({userId: req.userData.userId, email: req.userData.email, content: text, responsetype: type}).save();
        res.status(201).json({message: 'Thankyou for your feeback, it is valuable for us!', success: true});
    } catch (err){
        return next( new HttpError('Couldn\'t complete request, Send Again'), false, 500);
    }
    
};

exports.getUserbyId = getUserbyId;
exports.getUserbyEmail = getUserbyEmail;
exports.updateSlide = updateSlide;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.changePassword = changePassword;
exports.supportRequest = supportRequest;
exports.feedback = feedback;