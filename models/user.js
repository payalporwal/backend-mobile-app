const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const encrypt = require('mongoose-encryption');
const calls = require('./calls');
//const passportLocalMongoose = require("passport-local-mongoose");
//const findOrCreate = require("mongoose-findorcreate");

const secret = process.env.MONGOOSE_SECRET;

var current = new Date();
const timeStamp = new Date(Date.UTC(current.getFullYear(), 
current.getMonth(),current.getDate(),current.getHours(), 
current.getMinutes(),current.getSeconds(), current.getMilliseconds()));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlenth: 6 },
    phone: { type: Number },
    gender: { type: String, required: true },
    age: { type: Number, required: true },
    slideno: { type: Number, default: 0 },
    completedDoc: { type: Boolean, default: false},
    devicetoken: { type: String },
    active: { type: Boolean, require: true, default: true },
    hearcalls: { type: mongoose.Types.ObjectId, ref: 'callSchedule'},
    createdAt : { type: Date, default : timeStamp },
    updatedAt: { type: Date, default : timeStamp }
});

userSchema.plugin(encrypt, {secret:secret, encryptedFields: ['password']});
userSchema.plugin(uniqueValidator, {message: 'Already taken.'});
//userSchema.plugin(passportLocalMongoose);
//userSchema.plugin(findOrCreate);


module.exports = mongoose.model('User', userSchema);