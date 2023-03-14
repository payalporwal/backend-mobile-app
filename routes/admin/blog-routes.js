const router = require('express').Router();

const checkAuth = require('../../middleware/check_auth');
const blogControllers = require('../../controllers/admin/blog-controller');


//upload array of images
router
    .post('/create', checkAuth, blogControllers.uploadblogs)
    .post('/update/:blogId', checkAuth, blogControllers.updateblog)
    .post('/archive/:blogId',checkAuth, blogControllers.archiveblog);

//upload image
// router
//     .post('/create',fileUpload.single('blogs'), checkAuth, blogControllers.uploadblogs)
router
    .get('/getall', blogControllers.getallblogs)
    .post('/get/category', blogControllers.getblogbycategory)
    .get('/get/:blogId', blogControllers.getblogbyid);
    
module.exports = router;