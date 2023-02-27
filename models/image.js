const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const timeStamp = require('../utils/timestamp');

const Schema = mongoose.Schema;

const imageSchema = new Schema({
    name: { type:String, requied: true}, 
    alt: {type:String, required: true},
    size: {type:Number, required: true},
    image :{ data:Buffer, contentType: String},
    path: {type:String, required: true}
})

imageSchema.plugin(encrypt, {secret:process.env.MONGOOSE_SECRET, encryptedFields: [ 'path']});
module.exports = mongoose.model('image', imageSchema);