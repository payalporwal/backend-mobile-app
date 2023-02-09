const { validationResult } = require('express-validator');
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');

const HttpError = require('../utils/http-error');
const User = require('../models/user');
//const selectUser = require('../utils/select-user');
const callSchema = require('../models/calls');

require('dotenv').config();

var current = new Date();
const timeStamp = new Date(Date.UTC(current.getFullYear(), 
    current.getMonth(),current.getDate(),current.getHours(), 
    current.getMinutes(),current.getSeconds(), current.getMilliseconds())
);

const getCallToken = async (req, res, next) => {
    try{
        
        const { channel, slotid, expiry } = req.body;
        const callslot = await callSchema.findOne({id:slotid, expire: false});

        if(!callslot) {
            return next(new HttpError(
                'No valid slot found, Try Again',
                false,
                404
            ));
        }

        if(callslot.agoraToken) {
            return res.json({message: "Token Already Created", success: true, rtctoken: callslot.agoraToken});
        }
        const channelName = req.body.channel;
        if (!channelName) {
            return next(
                new HttpError('Channel is required, Recheck', false, 500)
            );
        }

        const uid = slotid;
        if(!uid || uid === '') {
            return next(
                new HttpError('Invalid access', false, 500)
            );
        }
        // get role
        const role = RtcRole.PUBLISHER;

        let expireTime = expiry;
        if (!expireTime || expireTime === '') {
            expireTime = 2700;
        } else {
            expireTime = parseInt(expireTime, 10);
        }


        const currentTime = Math.floor(Date.now() / 1000);
        const privilegeExpireTime = currentTime + expireTime;

    
        const token = RtcTokenBuilder.buildTokenWithUid(process.env.APP_ID, process.env.APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
        
        callslot.channel = channel;
        callslot.agoraToken = token;
        callslot.updatedAt = timeStamp;
        await callslot.save();

        res.status(201).json({ message: 'RTC Token Created', success: true, rtctoken : token});
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

const slotbook = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(
                new HttpError('Invalid inputs passed, Recheck', false, 422)
            );
        }

        const user = await User.findById(req.userData.userId);
        const { strength, date, note } = req.body;
        const slots = await callSchema.find({talkerUser: user, expire: false}).populate({
            path: 'talkerUser',
            select: 'username age gender'
        });
        if( slots.length !== 0 ){
            //console.log(slots);
            return next(new HttpError('Already Booked', false, 422));
        }
        
        const newcalls =  new callSchema({talkerUser: user ,strength: strength, date: date, note: note});
        await newcalls.save();
        newcalls.populate('talkerUser');
        
        user.calls = newcalls;
        await user.save();
        user.populate('hearcalls');
        res.status(201).json({message: 'Slot Booked!', success: true});
        
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

const gettalksideslots = async (req, res, next) => {
    try{
        const user = await User.findById(req.userData.userId);
        
        const slots = await callSchema.find({talkerUser: user}).populate({
            path: 'talkerUser',
            select: 'username age gender'
        }).select({date: 1, note:1, talkerUser:1, listenerUser:1});

        res.json({
            message: 'Your Slots',
            success: true,
            slots
        });
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

const gethearsideslots = async (req, res, next) => {
    try{
        const user = await User.findById(req.userData.userId);
        
        const slots = await callSchema.find({listenerUser: user}).populate({
            path: 'listenerUser',
            select: 'username age gender'
        }).select({date: 1, note:1, talkerUser:1, listenerUser:1});

        res.json({
            message: 'Your Slots',
            success: true,
            slots
        });
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

const cuttingCall = async(req, res, next ) => {
    try{
        const callslot = await callSchema.findOne({id:req.body.slotid, expire: false});
        callslot.expire = true;
        callslot.agoraToken = null;
        await callslot.save();
        res.status(200).json({message: "Call Ended", success: true});
    } catch(err){
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

exports.getCallToken = getCallToken;
exports.slotbook = slotbook;
exports.gettalksideslots = gettalksideslots;
exports.gethearsideslots = gethearsideslots;
exports.cuttingCall = cuttingCall;