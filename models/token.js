const mongoose = require('mongoose');


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
		default: Date.now,
		expires: 2 * 86400, //2d
	},
},
{
	timestamps: true,
});

module.exports = mongoose.model('userToken', userToken);