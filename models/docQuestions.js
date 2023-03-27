const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const timeStamp = require('../utils/timestamp');

const docQuestion = new Schema({
    user: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
    email: { type: String, required: true },// 
    skillset: [{
        skill: {type: String, required: true},
        level: {type: Number, required: true}
    }],
    questionaire : [{
        question: {type: String, required: true},
        answer: {type: String, required: true}
    }],
    skillpass: { type: String },
    questionairepass: { type: String },
    createdAt: { type: Date, default: timeStamp },
    updatedAt: { type: Date, default: timeStamp }
});

module.exports = mongoose.model('DocQuestion', docQuestion);
