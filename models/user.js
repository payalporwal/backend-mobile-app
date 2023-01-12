const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

var current = new Date();
const timeStamp = new Date(Date.UTC(current.getFullYear(), 
current.getMonth(),current.getDate(),current.getHours(), 
current.getMinutes(),current.getSeconds(), current.getMilliseconds()));

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlenth: 6,
    },
    phone: {
        type: Number,
        unique: true,
    },
    gender: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        require: true,
        default: true
    },
    createdAt : { 
        type: Date, 
        default : timeStamp 
    },
    updatedAt: {
        type: Date, 
        default : timeStamp 
    }
});

userSchema.plugin(uniqueValidator, {message: 'Already taken.'});

module.exports = mongoose.model('User', userSchema);