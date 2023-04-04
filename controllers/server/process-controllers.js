const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const UserToken = require('../../models/token');
const HttpError = require('../../utils/http-error');
const User = require('../../models/user');
const supports = require('../../models/support');
const feedbacks = require('../../models/feedback');
const config = require('../../config');

require('dotenv').config();

const timeStamp = require('../../utils/timestamp');

//access data apis
exports.getUserbyId = async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id);
    
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
            profile: user.profile,
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

        const user = await User.findById(req.user.id);
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
        const userId = req.user.id;

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
        user.username = username;
        user.phone = phone;
        user.age = age;
        user.gender = gender;
        user.updatedAt = timeStamp;

        await user.save();

        res.status(200).json({message: 'Updation Complete', success: true});
    } catch (err) {
        return next(new HttpError('Something went wrong, Could not Upload!', false, 500));
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
        const userId = req.user.id;
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
            const error = new HttpError('Wrong credentials, check password', false, 403 );
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
        await User.findByIdAndUpdate(req.user.id, {active: false});
        await UserToken.findOneAndDelete({userId: req.user.id});
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
        const user = await User.findById(req.user.id);
        await new supports({userId: user.id, username: user.username, email: user.email, text: text }).save();
        res.status(201).json({message: 'Request sent, Will get back to you soon', success: true});
    } catch (err){
        return next( new HttpError('Couldn\'t complete request, Send Again', false, 500));
    }
    
};

exports.feedback = async (req, res, next) =>{
    try{
        const { text, rating } = req.body;
        if(!text && !rating) {
            return next(HttpError('Write Something and try again', false, 400));
        }
        const user = await User.findById(req.user.id);
        await new feedbacks({username: user.username, age: user.age, gender: user.gender, email: user.email, text: text, rating: rating}).save();
        res.status(201).json({message: 'Thankyou for your feeback, it is valuable for us!', success: true});
    } catch (err){
        return next( new HttpError('Couldn\'t complete request, Send Again', false, 500));
    }
    
};

// image string upload with image type
exports.uploadImage = async (req, res, next) => {
    try{
        const {type, imgdata, imgtype} = req.body;
        if(!imgdata){
            return next(new HttpError('Please upload a image', false, 422));
        }
        /*
        const files = await cloudinary.uploader.upload(req.file.path);
        const path = files.secure_url;*/
        // find user
        const user = await User.findById(req.user.id);
        const image = {
            contentType: imgtype,
            path: imgdata
        };
        // check type
        if(type === 'profile') {
            user.profile = image;
        } else if(type === 'verifydoc') {
            if(user.verifydoc !== null ){
                return next(new HttpError("Documents already uploaded, wait for review!", false, 422));
            }
            user.verifydoc = image;
        } else {
            return next(new HttpError("Please provide valid 'type' of request", false, 422));
        }
        await user.save();
        res.status(200).json({ message: "Image uploaded successfully", success: true, image});
    } catch(error){
        console.log(error);
        return next(error);
    }
};