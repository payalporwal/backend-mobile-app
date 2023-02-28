const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const timeStamp = require('../utils/timestamp');

const docQuestion = new Schema({
    user: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
    skillset: [{
        skill: {type: String, required: true},
        level: {type: Number, required: true}
    }],
    questionaire : [{
        question: {type: String, required: true},
        answer: {type: String, required: true}
    }],
    createdAt: { type: Date, default: timeStamp },
    updatedAt: { type: Date, default: timeStamp }
});

module.exports = mongoose.model('DocQuestion', docQuestion);