const fs = require('fs');
const HttpError = require('../../utils/http-error');
const userSchema = require('../../models/admin');
const blogSchema = require('../../models/blog');
//const imageSchema = require('../../models/image');

/* upload image separately
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
}; */


//upload content of blog
exports.uploadblogs = async (req, res, next) => {
    try{
        const user = await userSchema.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'content')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const {title, description, content, category, alt, imgdata, imgtype } = req.body;
        /*
        const image = images.map((image) => {
            return {
                name: image.name,
                imageid: image.imageid
            }
        });*/

        const image = {
            alt: alt,
            data: imgdata,
            contentType: imgtype,
        }
        const blog = new blogSchema({ title, description, content, category, images : image });
        await blog.save();
        res.json({ message: 'New blog added' , success:true});
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
        const {title, description, content, category, alt, imgdata, imgtype} = req.body;
        const image = {
            alt: alt,
            data: imgdata,
            contentType: imgtype,
        }
        const blog = await blogSchema.findById(req.params.blogId);
        blog.title = title;
        blog.description = description;
        blog.category = category;
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
exports.archiveblog = async (req, res, next) => {
    try{
        const user = await userSchema.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'content')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const blog = await blogSchema.findById(req.params.blogId);
        blog.archive = true;
        await blog.save();
        res.json({ message: 'Blog archived' , success:true});
    }
    catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

// get all blogs
exports.getallblogs = async (req, res, next) => {
    try{
        const blogs = await blogSchema.find({archive: false}).select('title description content category images');
        if(blogs.length === 0){
            return res.json({ message: 'No Blogs Found!' , success:true});
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
        const blog = await blogSchema.findById(req.params.blogId).select('title description content category images');
        if(!blog || blog.archive){
            return res.json({ message: 'This blog is no longer available' , success:true, blog});
        }
        res.json({ message: 'Blog is here' , success:true, blog});
    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};

// get blog by category 
exports.getblogbycategory = async(req, res, next) =>{
    try{
        if(!req.body.category){
            return next(new HttpError('Category is required', false, 400));
        }
        const blogs = await blogSchema.find({category: req.body.category, archive: false}).select('title description content category images');
        if(blogs.length === 0){
            return res.json({ message: 'No Blogs Found!' , success:true});
        }
        res.json({ message: 'Blogs are here' , success:true, blogs});
    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
};