const jwt = require('jsonwebtoken');
const HttpError = require('../utils/http-error');
const UserToken = require('../models/token');
const User = require('../models/user');
const generateTokens = require('../utils/generate-token');

require('dotenv').config();


const getnewToken = async (req, res, next) => {
    try{
        if(!req.body.token){
            return next(new HttpError('Provide valid token', false, 422));
        }
        const token = UserToken.findOne({token: req.body.token});
        if(!token){
            return next(new HttpError('Invalid Access, Provide valid Token', false, 404));
        }
        const decodedToken = jwt.verify(req.body.token, process.env.REFRESH_TOKEN_PRIVATE_KEY);
        
        const thisUser = await User.findOne({id: decodedToken.userId});
        if(!thisUser) {
            return next(new HttpError('Cannot Access, no user found', false, 403));
        }
        const { accessToken, refreshToken } = await generateTokens(thisUser);

        res.header('Authentication', 'Bearer ' + accessToken).status(201).json({
            message: "Access token created successfully",
            success: true,
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
        if(!req.body.token){
            return next(new HttpError('Provide valid token', false, 422));
        }
 
         const userToken = await UserToken.findOne({ token: req.body.token });
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