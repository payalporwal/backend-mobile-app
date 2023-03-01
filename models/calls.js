const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const timeStamp = require('../utils/timestamp');

const Schema = mongoose.Schema;

const scheduleCall = new Schema({
    channel: { type: String },
    date: { type: Number, required: true },
    strength: { type: Number, required: true },
    note: { type: String, required: true },
    talkerUser: {type: mongoose.Types.ObjectId, ref: 'User'},
    listenerUser: {type: mongoose.Types.ObjectId, ref: 'User'}, 
    agoraToken: { type: String, default: null },
    expire: { type: Boolean, default: false },
    createdAt : { type: Date, default : timeStamp },
    updatedAt: { type: Date, default : timeStamp }
});

scheduleCall.plugin(uniqueValidator, {message: 'Already Booked!'});

module.exports = mongoose.model('callSchedule', scheduleCall);