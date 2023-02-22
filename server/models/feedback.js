const mongoose = require('mongoose');

const timeStamp = require('../../utils/timestamp');

const Schema = mongoose.Schema;

const feedback = new Schema({
	username: { type: String, required: true },
    age: { type: Number, required: true },
    gender:{ type: String,required: true },
    email: { type: String, required: true },
    rating: { type: Number, required: true },
	text: { type: String, required: true },
	createdAt: { type: Date, default: timeStamp },
});

module.exports = mongoose.model('feedbacks', feedback);