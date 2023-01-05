const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config();


const HttpError = require('../utils/http-error');
const User = require('../models/user');
const generateTokens = require('../utils/generate-token');

const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
        new HttpError('Invalid inputs passed, please fill again.', false, 422)
        );
    }
  
    try {
      const { username, email, password, age, gender } = req.body;
      const existingUser = await User.findOne({ email: email });
  
      if (existingUser) {
        if(existingUser.active){
          const error = new HttpError(
            'User exists already, please login instead.',
            false,
            422
          );
          return next(error);
        } else {
          await existingUser.remove();
        }
      }

      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashedPassword = await bcrypt.hash(password, salt);
      const createdUser = new User({
        username,
        email,
        password: hashedPassword,
        gender,
        age
      });

      createdUser.save();

      res.status(201).json({
        message: 'User Register Successfully!',
        success: true
      });

    } catch (err) {
      const error = new HttpError(
        'User Registration Failed, please try again later.',
        false,
        500
      );
      console.log(err);
      return next(error);
    }
};
  
const login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const existingUser = await User.findOne({ email: email });
    
      if (!existingUser || !existingUser.active) {
        const error = new HttpError(
          'User does not exist, Register yourself',
          false,
          403
        );
        return next(error);
      }
  
      let isValidPassword = false;
      try{
        isValidPassword = await bcrypt.compare(password, existingUser.password);
      } catch (err) {
        const error = new HttpError(
          'Could not log you in, please check your credentials and try again.',
          false,
          500
        );
        return next(error);
      }
  
      if (!isValidPassword) {
        const error = new HttpError(
          'Invalid credentials, Check your Password',
          false,
          403
        );
        return next(error);
      }
      const { accessToken, refreshToken } = await generateTokens(existingUser);
    
  
      res.header('Authorization', 'Bearer '+ accessToken).json({ 
        message: 'Logged In Successfully!',
        success: true,
        user: existingUser
      });
      
    } catch (err) {
      console.log(err);
      const error = new HttpError(
        'Logging in failed, please try again later.',
        false,
        500
      );
      return next(error);
    }
};

exports.register = register;
exports.login = login;