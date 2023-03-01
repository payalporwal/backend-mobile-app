const mongoose = require('mongoose');

const timeStamp = require('../utils/timestamp');

const Schema = mongoose.Schema;

const userToken = new Schema({
    userId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	token: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: timeStamp,
		expires: 2 * 86400, //2d
	},
});

module.exports = mongoose.model('userToken', userToken);