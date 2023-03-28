const router = require('express').Router();
const upload = require('../../middleware/multer');
const checkAuth = require('../../middleware/check_auth');
const blogControllers = require('../../controllers/admin/blog-controller');


//upload array of images
router
    .post('/create', checkAuth, blogControllers.uploadblogs)
    .post('/update/:blogId', checkAuth, blogControllers.updateblog)
    .post('/archive/:blogId',checkAuth, blogControllers.archiveblog)
    .post('/upload/image', upload.single('blogs'), checkAuth, blogControllers.uploadimages);


//upload image
router
    
    router
    .get('/getall', blogControllers.getallblogs)
    .post('/get/category', blogControllers.getblogbycategory)
    .get('/get/:blogId', blogControllers.getblogbyid);
    
module.exports = router;