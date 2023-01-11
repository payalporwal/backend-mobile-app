const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OTPschema = new Schema({
    userId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
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
		default: Date.now,
		expires: '5m', //5 min
	},
},
{
	timestamps: true,
});

module.exports = mongoose.model('OTP', OTPschema );