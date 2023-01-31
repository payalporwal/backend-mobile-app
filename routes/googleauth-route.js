const router = require('express').Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

require('dotenv').config();

const User = require('../models/user');
const UserToken = require('../models/token');

const HttpError = require('../utils/http-error');


let accessToken;
let refreshToken;

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/pace",
    scope: ['profile'],
    state: true
    //userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  async function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    await User.findOrCreate({ googleId: profile.id, username: profile.displayName, email: profile.email , age: profile.age, gender: profile.gender});
  }
));

router.get('/failure', (req, res) => res.send('failed'));

router.get('/auth/google', passport.authenticate('google', {scope: ["profile"]}));

router.get('/auth/google/pace', passport.authenticate('google', { failureRedirect: "/failure"}),
function(req, res){
    res.redirect('/home'); //home route
});

router.get('/home', async (req, res, next ) => {
    try{
        const user = await User.findOne({googleId: googleId});
       await new UserToken({ userId: user.id, token: refreshToken }).save();
    res.header({'Authorization': 'Bearer ' + accessToken }).json({message: 'Google Login Successful!', success: true});
    } catch(err) {
        console.log(err);
        const error = new HttpError(
            'Logging in failed, please try again later.',
            false,
            500
          );
          return next(error);
    }
    
});


module.exports = router;