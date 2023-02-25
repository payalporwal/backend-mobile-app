const fs = require('fs');
const HttpError = require('../../utils/http-error');
const config = require('../../config');
const userSchema = require('../../models/admin');
const blogSchema = require('../../models/blog');
const imageSchema = require('../../models/image');

// upload image separately
exports.uploadimage = async (req, res, next) => {
    try{
        const file = req.file;
        const fileName = file.originalname;
        const filePath = file.path;
        const fileMime = file.mimetype;
        const fileSize = file.size;
        if(fileSize > config.maxFileSize){
            return next(new HttpError('File size is too large', false, 400));
        }
        const image = new imageSchema({
            name: fileName,
            alt: fileName,
            size: fileSize,
            image: {
                data: fs.readFileSync(filePath),
                contentType: fileMime,
            },
            url: `${config.https}://${config.HOST}:${config.PORT}/${filePath}`
        });
        await image.save();
        res.json({ message: 'Image added' , success:true, image});
    }   
    catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};


//upload content then

exports.uploadblogs = async (req, res, next) => {
    try{
        const user = await userSchema.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'content')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const {title, description, category, content} = req.body;

        const blog = new blogSchema({
            title,
            description,
            category,
            content,
            image : [ uploadimages ]
        });
        await blog.save();
        res.json({ message: 'Blog added' , success:true, blog});
    }
    catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};