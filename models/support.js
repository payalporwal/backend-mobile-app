const mongoose = require('mongoose');

const timeStamp = require('../utils/timestamp');

const Schema = mongoose.Schema;

const supportRequests = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true },
	username: { type: String, required: true },
    email: { type: String, required: true },
	text: { type: String, required: true },
	resolved: {type:Boolean, default: false },
	createdAt: { type: Date, default: timeStamp },
});

module.exports = mongoose.model('supportrequests', supportRequests);