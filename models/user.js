const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const encrypt = require('mongoose-encryption');

const timeStamp = require('../utils/timestamp');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlenth: 6 },
    phone: { type: Number },
    gender: { type: String, required: true },
    age: { type: Number, required: true },
    slideno: { type: Number, default: 0 },
    completedDoc: { type: Boolean, default: false},
    profile: { image: Buffer, contentType: String, path: String},
    verifydoc:{ image: Buffer, contentType: String, path: String},
    verified: { type:Boolean, default: false },
    devicetoken: { type: String },
    active: { type: Boolean, require: true, default: true },
    hearcalls: { type: mongoose.Types.ObjectId, ref: 'callSchedule'},
    createdAt : { type: Date, default : timeStamp },
    updatedAt: { type: Date, default : timeStamp }
});

userSchema.plugin(encrypt, {secret: process.env.MONGOOSE_SECRET, encryptedFields: ['password', 'profile.path', 'verifydoc.path']});
userSchema.plugin(uniqueValidator, {message: 'Already taken.'});


module.exports = mongoose.model('User', userSchema);