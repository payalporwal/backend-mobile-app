const mongoose = require('mongoose');

const timeStamp = require('../utils/timestamp');

const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: { type: String, required: true },
    images: {
        alt: { type: String, required:true},
        data: { type: String, required: true},
        contentType: { type: String, required: true}
    },
    description: { type: String, required: true },
    content: { type:String, required: true},
    category: { type: String, required: true, enum:['anxiety', 'depression', 'mental health', 'lifestyle', 'stress']},
    archive : { type : Boolean, default: false },
   // keyword: {type:String, enum: ['Must Read']},
    createdAt : { type: Date, default : timeStamp },
    updatedAt:  { type: Date, default : timeStamp }
});

module.exports = mongoose.model('blog', blogSchema);