const mongoose = require('mongoose');

const timeStamp = require('../utils/timestamp');

const Schema = mongoose.Schema;

const blog = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { image: Buffer, contentType: String, require: true},
    createdAt : { type: Date, default : timeStamp },
    updatedAt: { type: Date, default : timeStamp }
});

scheduleCall.plugin(uniqueValidator, {message: 'Already Booked!'});

module.exports = mongoose.model('callSchedule', scheduleCall);