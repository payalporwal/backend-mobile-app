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
        const callslot = await callSchema.findById(slotid);

        if(!callslot || callslot.expire ) {
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
        const { strength, datetime, note } = req.body;
        const slot = await callSchema.findOne({talkerId: req.userData.userId});
        if(slot && !slot.expire){
            return next(new HttpError('Already Booked!', false, 400));
        }
        await new callSchema({talkerId: req.userData.userId, strength: strength, dateTime: datetime, note: note}).save();
        
        res.status(201).json({message: 'Slot Booked!', success: true});
        
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

const getslotsfortalk = async (req, res, next) => {
    try{
        const slots = await callSchema.findOne({talkerId: req.userData.userId});
        
        if(!slots ) {
            return next(new HttpError(
                'No valid slot found, Try Again',
                false,
                404
            ));
        }
        if(slots.expire ) {
            return next(new HttpError(
                'No valid slot found, Try Again',
                false,
                404
            ));
        }

        const healr = await User.findById(slots.listenerId);
        if(!healr){
            res.json({
                message: 'Your Slots',
                success: true,
                slotid: slots.id,
                datetime: slots.dateTime,
                healer: null
            });
        }

        res.json({
            message: 'Your Slots',
            success: true,
            slotid: slots.id,
            datetime: slots.dateTime,
            healer: {
                name: healr.username,
                age: healr.age,
                gender: healr.gender
            }
        });

    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

const getslotsforhear = async(req, res, next) => {
    try{
        const slots = await callSchema.findOne({listenerId: req.userData.userId});
    
        if(!slots ) {
            return next(new HttpError(
                'No valid slot found, Try Again',
                false,
                404
            ));
        }
        if(slots.expire ) {
            return next(new HttpError(
                'No valid slot found, Try Again',
                false,
                404
            ));
        }
        const speaker = await User.findById(slots.talkerId);

        res.json({
            message: 'Your Slots',
            success: true,
            slotid: slots.id,
            datetime: slots.dateTime,
            note: slots.note,
            talker: {
                name: speaker.username,
                age: speaker.age,
                gender: speaker.gender
            }
        })

    } catch (err) {
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

const cuttingCall = async(req, res, next ) => {
    try{
        await callSchema.findByIdAndUpdate(req.body.slotid, {expire: true});
        res.status(200).json({message: "Call Ended", success: true});
    } catch(err){
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

exports.getCallToken = getCallToken;
exports.slotbook = slotbook;
exports.getslotsforhear = getslotsforhear;
exports.getslotsfortalk = getslotsfortalk;
exports.cuttingCall = cuttingCall;