const mongoose = require('mongoose');

const timeStamp = require('../utils/timestamp');

const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: { type: String, required: true },
    image: [{ image: Buffer, contentType: String}],
    description: { type: String, required: true },
    content: { type:String, required: true},
    category: { type: String, required: true},
    createdAt : { type: Date, default : timeStamp }
});

module.exports = mongoose.model('blog', blogSchema);