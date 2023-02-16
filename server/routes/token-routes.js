const express = require('express');
const jwt = require('jsonwebtoken');
const HttpError = require('../../utils/http-error');
const UserToken = require('../models/token');
const User = require('../models/user');
const generateTokens = require('../../utils/generate-token');

require('dotenv').config();

const router = express.Router();

router.post('/refresh/:uid', async (req, res, next) => {
    try{
        const tokenData = await UserToken.findOne({userId: req.params.uid});
        if(!tokenData){
            return next(new HttpError('Invalid Access, Try Logging In', false, 404));
        }
        const decodedToken = jwt.verify(tokenData.token, process.env.REFRESH_TOKEN_PRIVATE_KEY);
        
        const thisUser = await User.findOne({id: decodedToken.userId, active: true});
        if(!thisUser) {
            return next(new HttpError('No user found, Register yourself', false, 403));
        }
        const accessToken = await generateTokens(thisUser);

        res.status(201).json({
            message: "Token creation successful",
            success: true,
            token: accessToken
        });
    } catch(err){
        console.log(err);
        return next(
            new HttpError('Couldn\'t update token, Try again', false, 500)
        );
    }
 });

router.delete('/logout/:uid', async(req, res, next) => {
    try {
        const userToken = await UserToken.findOne({ userId: req.params.uid });
        if (!userToken)
            return res
                .status(200)
                .json({message: "Logged Out Sucessfully", success: true});

       await UserToken.findByIdAndDelete(userToken.id);
        res.status(200).json({ message: "Logged Out Sucessfully" , success: true});
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Couldn\'t LogOut', false, 500));
    }
});

module.exports = router;
