const jwt = require('jsonwebtoken');
const HttpError = require('../utils/http-error');
const UserToken = require('../models/token');
const User = require('../models/user');
const generateTokens = require('../utils/generate-token');

require('dotenv').config();


const getnewToken = async (req, res, next) => {
    try{
        const tokenData = await UserToken.findOne({userId: req.params.uid});
        if(!tokenData){
            return next(new HttpError('Invalid Access, Login Again', false, 404));
        }
        const decodedToken = jwt.verify(tokenData.token, process.env.REFRESH_TOKEN_PRIVATE_KEY);
        
        const thisUser = await User.findOne({id: decodedToken.userId});
        if(!thisUser) {
            return next(new HttpError('Cannot Access, no user found', false, 403));
        }
        const accessToken = await generateTokens(thisUser);

        res.status(201).json({
            message: "Token created successfully",
            success: true,
            token: accessToken
        });
    } catch(err){
        console.log(err);
        return next(
            new HttpError('Could not update token, Try again', false, 500)
        );
    }
 };
 
 const logoutUser = async(req, res, next) => {
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
         return next(new HttpError('Something went wrong, Could not LogOut', false, 500));
     }
 };
 

exports.getnewToken = getnewToken;
exports.logoutUser = logoutUser;