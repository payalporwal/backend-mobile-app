const router = require('express').Router();
const fs = require('fs');
const HttpError = require('../../utils/http-error');
const checkAuth = require('../../middleware/check_auth');
const blogSchema = require('../../models/blog');

const fileUpload = require('../../middleware/file_upload');
const blogControllers = require('../../controllers/admin/blog-controller');


//upload array of images
router
    .post('/create',fileUpload.single('blogs'), checkAuth, blogControllers.uploadblogs)
    .post('/update/:blogId', fileUpload.single('blogs'), checkAuth, blogControllers.updateblog)
    .delete('/delete/:blogId',  checkAuth, blogControllers.deleteblog);


router
    .get('/getall', blogControllers.getallblogs)
    .get('/get/:blogId', blogControllers.getblogbyid);
    
//.get('/get/:category', blogControllers.getblogbycategory);

module.exports = router;