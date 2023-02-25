const router = require('express').Router();
const fs = require('fs');
const HttpError = require('../../utils/http-error');
const checkAuth = require('../../middleware/check_auth');
const blogSchema = require('../../models/blog');

const fileUpload = require('../../middleware/file_upload');
const blogControllers = require('../../controllers/admin/blog-controller');


//upload array of images
router.post('/upload/image', fileUpload.single('blogs') , blogControllers.uploadimage);

// upload blogs 
router.post('/create', checkAuth, blogControllers.uploadblogs);

router.get('/getall', async (req, res, next) => {
    try{
        const blogs = await blogSchema.find();
        res.json({ message: 'All blogs are here' , success:true, blogs});
    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
});

router.get('/get/:blogId', async (req, res, next) => {
    try{
        const blog = await blogSchema.findById(req.params.blogId);
        res.json({ message: 'Blog is here' , success:true, blog});
    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
});

router.get('/getcategory/:category', async(req, res, next) =>{
    try{
        const blogs = await blogSchema.find({category: req.params.category});
        res.json({ message: 'Blogs are here' , success:true, blogs});
    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
});

module.exports = router;