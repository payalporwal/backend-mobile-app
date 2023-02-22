const mongoose = require('mongoose');

const timeStamp = require('../../utils/timestamp');

const Schema = mongoose.Schema;

const OTPschema = new Schema({
	otp: {
		type: String,
		required: true,
	},
    email: {
        type: String,
        required: true,
        unique: true,
    },
	otptype: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: timeStamp,
		expires: '5m', //5 min
	},
});

module.exports = mongoose.model('OTP', OTPschema );