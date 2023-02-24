const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const encrypt = require('mongoose-encryption');

const secret = process.env.MONGOOSE_SECRET;

const timeStamp = require('../utils/timestamp');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlenth: 6 },
    role: { type: String, enum: ['admin', 'content', 'support'] },
    createdAt: { type: Date, default: timeStamp },
    updatedAt: { type: Date, default: timeStamp }
});
adminSchema.plugin(encrypt, {secret:secret, encryptedFields: ['password']});
adminSchema.plugin(uniqueValidator, {message: 'Already taken.'});

module.exports = mongoose.model('Admin', adminSchema);