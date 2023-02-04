const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

var current = new Date();
const timeStamp = new Date(Date.UTC(current.getFullYear(), 
current.getMonth(),current.getDate(),current.getHours(), 
current.getMinutes(),current.getSeconds(), current.getMilliseconds()));

const Schema = mongoose.Schema;

const scheduleCall = new Schema({
    channel: { type: String },
    talkerId: { type: Schema.Types.ObjectId, required: true, unique: true },
    listenerId: { type: Schema.Types.ObjectId, default: '63d776c609c5abbd36488bdf' },
    dateTime: { type: String, required: true },
    strength: { type: Number, required: true },
    note: { type: String, required: true },
    agoraToken: { type: String, default: null },
    expire: { type: Boolean, default: false },
    createdAt : { type: Date, default : timeStamp },
    updatedAt: { type: Date, default : timeStamp }
});

scheduleCall.plugin(uniqueValidator, {message: 'Already Booked!'});

module.exports = mongoose.model('callSchedule', scheduleCall);