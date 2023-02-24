const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const timeStamp = require('../utils/timestamp');

const docQuestion = new Schema({
    user: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
    skillset: [{type:Array}],
    questionaire : [{type:Array}],
    createdAt: { type: Date, default: timeStamp },
    updatedAt: { type: Date, default: timeStamp }
});

module.exports = mongoose.model('DocQuestion', docQuestion);
