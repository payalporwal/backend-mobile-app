const mongoose = require('mongoose');

const timeStamp = require('../utils/timestamp');

const Schema = mongoose.Schema;

const imageSchema = new Schema({
    name: { type:String, requied: true}, 
    alt: {type:String, required: true},
    size: {type:Number, required: true},
    image :{ data:Buffer, contentType: String},
    url: {type:String, required: true}
})

module.exports = mongoose.model('image', imageSchema);