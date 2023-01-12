const mongoose = require('mongoose');

var current = new Date();
const timeStamp = new Date(Date.UTC(current.getFullYear(), 
current.getMonth(),current.getDate(),current.getHours(), 
current.getMinutes(),current.getSeconds(), current.getMilliseconds()));

const Schema = mongoose.Schema;

const UserAppResponse = new Schema({
    userId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
    email: {
        type: String,
        required: true,
        unique: true,
    },
	content: {
		type: String,
		required: true,
	},
    responsetype: {
        type: String,
        required: true,
    },
	createdAt: {
		type: Date,
		default: timeStamp,
	},
});

module.exports = mongoose.model('UserAppResponse', UserAppResponse);