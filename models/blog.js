const mongoose = require('mongoose');

const timeStamp = require('../utils/timestamp');

const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: { type: String, required: true },
    /*
    images: [{ 
        name: { type: String, required: true },
        image: {  type: mongoose.Schema.Types.ObjectId, ref: 'image'  }
    }],*/
    images: {
        alt: { type: String, required:true},
        path: { type: String, required: true},
        data: { type: Buffer, required: true},
        contentType: { type: String, required: true}
    },
    description: { type: String, required: true },
    content: { type:String, required: true},
   // category: { type: String, required: true, enum:['anxiety', 'depression']},
   // keyword: {type:String, enum: ['Must Read']},
    createdAt : { type: Date, default : timeStamp },
    updatedAt:  { type: Date, default : timeStamp }
});

module.exports = mongoose.model('blog', blogSchema);