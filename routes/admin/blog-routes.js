const router = require('express').Router();
const HttpError = require('../../utils/http-error');
const checkAuth = require('../../middleware/admin_auth');
const blogSchema = require('../../models/blog');
const fileUpload = require('../../middleware/file_upload');

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

router.get('/getbycategory/:category', async(res, req, next) =>{
    try{
        const blogs = await blogSchema.find({category: req.params.category});
        res.json({ message: 'Blogs are here' , success:true, blogs});
    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
});


router.post('/create', fileUpload.any('image') ,checkAuth, async (req, res, next) => {
    try{
        const user = req.userData.userId;
        if(user.roles === 'support'){
            return res.json({message: 'You are not authorized to create a blog', success: false});
        }
        const {title, content, description, category} = req.body;
        const newblog =  new blogSchema({title: title, content: content, description: description, category: category,image: []});
        await newblog.save();
        res.status(201).json({message: 'Blog Created!', success: true});
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
});

module.exports = router;