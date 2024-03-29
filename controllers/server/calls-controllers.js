const { validationResult } = require('express-validator');
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');
const HttpError = require('../../utils/http-error');
const User = require('../../models/user');
const callSchema = require('../../models/calls');

require('dotenv').config();

const timeStamp = require('../../utils/timestamp');

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

        const user = await User.findById(req.user.id);
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
const time = Date.now();
const gettalksideslots = async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id);
        
        const talker = await callSchema.find({talkerUser: user, expire: false}).populate({
            path: 'talkerUser listenerUser',
            select: 'username age gender'
        }).select({date: 1, note:1, strength:1,  talkerUser:1, listenerUser:1});

        const listener = await callSchema.find({listenerUser: user,  expire: false}).populate({
            path: 'talkerUser listenerUser',
            select: 'username age gender'
        }).select({date: 1, note:1, strength:1, talkerUser:1, listenerUser:1});

        let text, slot;
        if(talker.length !== 0){
            text = 'You are Talker!';
            slot = talker;
        } else if(listener.length !== 0){
            text = 'You are Listener!';
            slot = listener;
        } else {
            text = 'You do not have any slot!';
            slot = [];
        }
        
        if(slot.length !== 0){
            console.log(slot.date > time - 300);
            if(slot.date < time - 300){
                slot.expire = true;
                await slot.save();
                return next(new HttpError('Call expired already!', false, 400));
            }
        }
        res.json({
            message: text,
            success: true,
            slot
        });
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};
/*
const gethearsideslots = async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id);
        
        const slots = await callSchema.find({listenerUser: user,  expire: false}).populate({
            path: 'talkerUser listenerUser',
            select: 'username age gender'
        }).select({date: 1, note:1, strength:1, talkerUser:1, listenerUser:1});

        if(slots){
            console.log(slots.date > time - 300);
            if(slots.date < time - 300){
                slots.expire = true;
                await slots.save();
                return next(new HttpError('Call expired already!', false, 400));
            }
        }
        res.json({
            message: 'Your Slots',
            success: true,
            slots
        });
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};*/

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
//exports.gethearsideslots = gethearsideslots;
exports.cuttingCall = cuttingCall;