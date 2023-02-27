const fs = require('fs');
const HttpError = require('../../utils/http-error');
const config = require('../../config');
const userSchema = require('../../models/admin');
const blogSchema = require('../../models/blog');
const imageSchema = require('../../models/image');

// upload image separately
exports.uploadimage = async (req, res, next) => {
    try{
        const user = await userSchema.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'content')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const file = req.file;
        const filePath = file.path;
        const fileMime = file.mimetype;
        const fileSize = file.size;
        const {name, alt} = req.body;
        const image = new imageSchema({
            name: name,
            alt: alt,
            size: fileSize,
            image: {
                data: fs.readFileSync(filePath),
                contentType: fileMime,
            },
            path: `${config.https}://${config.HOST}:${config.PORT}/${filePath}`
        });
        const path = image.path;
        await image.save();
        res.json({ message: 'Image added' , success:true, path});
    }   
    catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
}; 


//upload content of blog
exports.uploadblogs = async (req, res, next) => {
    try{
        const user = await userSchema.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'content')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const {title, description, content, alt} = req.body;
        /*
        const image = images.map((image) => {
            return {
                name: image.name,
                imageid: image.imageid
            }
        });*/

        const image = {
            alt: alt,
            path: req.file.path,
            data: fs.readFileSync(req.file.path),
            contentType: req.file.mimetype,
        }
        const blog = new blogSchema({ title, description, content, images : image });
        await blog.save();
        console.log(blog.images.path);
        res.json({ message: 'Blog added' , success:true});
    }
    catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};


// update blog
exports.updateblog = async (req, res, next) => {
    try{
        const user = await userSchema.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'content')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const {title, description, content, alt} = req.body;
        const image = {
            alt: alt,
            path: req.file.path,
            data: fs.readFileSync(req.file.path),
            contentType: req.file.mimetype,
        }
        const blog = await blogSchema.findById(req.params.blogId);
        blog.title = title;
        blog.description = description;
        //blog.category = category;
        blog.content = content;
        blog.images = image;
        await blog.save();
        res.json({ message: 'Blog updated' , success:true});
    }
    catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

// delete blogs
exports.deleteblog = async (req, res, next) => {
    try{
        const user = await userSchema.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'content')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const blog = await blogSchema.findById(req.params.blogId);
        await blog.remove();
        res.json({ message: 'Blog deleted' , success:true});
    }
    catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

// get all blogs
exports.getallblogs = async (req, res, next) => {
    try{
        const blogs = await blogSchema.find();
        if(!blogs){
            return res.json({ message: 'No Blogs Found!' , success:true, blogs});
        }
        res.json({ message: 'All blogs are here' , success:true, blogs});
    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

// get blog by id
exports.getblogbyid =  async (req, res, next) => {
    try{
        const blog = await blogSchema.findById(req.params.blogId);
        if(!blog){
            return res.json({ message: 'No Blogs Found!' , success:true, blog});
        }
        res.json({ message: 'Blog is here' , success:true, blog});
    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

/* get blog by category 
exports.getblogbycategory = async(req, res, next) =>{
    try{
        const blogs = await blogSchema.find({category: req.params['category']});
        if(!blogs){
            return res.json({ message: 'No Blogs Found!' , success:true, blogs});
        }
        res.json({ message: 'Blogs are here' , success:true, blogs});
    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};*/