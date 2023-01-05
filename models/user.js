const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

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
    }
},
{
	timestamps: true,
});

userSchema.plugin(uniqueValidator, {message: 'Already taken.'});

module.exports = mongoose.model('User', userSchema);