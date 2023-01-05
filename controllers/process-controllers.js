const { validationResult } = require('express-validator');
const UserToken = require('../models/token');

const HttpError = require('../utils/http-error');
const User = require('../models/user');


const getUserbyId = async (req, res, next) => {
    try{
        const user = await User.findById(req.userData.userId).select("-password");
    
        if(!user) {
            const error = new HttpError(
                'Could not find user for the provided id.',
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
            gender: user.gender
        });
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find user profile. Try Again!',
            false,
            500
        );
        return next(error);
    }
};

const getUserbyEmail = async (req, res, next) => {
    try{
        const user = await User.findOne({ email: `${req.userData.email}` }).select("-password");
        if(!user) {
            const error = new HttpError(
                'Could not find user for the provided email.',
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
            gender: user.gender
        });
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find user profile. Try Again!',
            false,
            500
        );
        return next(error);
    }
};

const updateUser = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', false, 422)
        );
        }

        const { username, phone, age, gender } = req.body;
        const userId = req.userData.userId;

        const user = await User.findById(userId);
        user.username = username;
        user.phone = phone;
        user.age = age;
        user.gender = gender;

        await user.save();

        res.status(200).json({message: 'Updation Completed', success: true});
    } catch (err) {
        const error = new HttpError(
        'Something went wrong, could not update profile.', false,
        500
        );
        return next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try{
        await User.findByIdAndUpdate(req.userData.userId, {active: false});
        await UserToken.findOneAndDelete({userId: req.userData.userId});
        res.status(200).json({message: 'Deleted User', success: true});
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Could not Delete!', false, 500));
    }
};


exports.getUserbyId = getUserbyId;
exports.getUserbyEmail = getUserbyEmail;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
