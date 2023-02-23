const express = require('express');
const { check } = require('express-validator');

const checkAuth = require('../../middleware/check_auth');
const fileUpload = require('../../middleware/file_upload');
const processControllers = require('../../controllers/server/process-controllers');

const router = express.Router();

router.use(checkAuth);


router.get('/dashboard', processControllers.getUserbyId);

router.post('/slideupdate', [check('slideno').isNumeric(), check('completedDoc').isBoolean()] ,processControllers.updateSlide);

router.post('/supportrequest', processControllers.supportRequest);

router.post('/feedback', processControllers.feedback);

router.post('/verification', fileUpload.single('verifydoc'), processControllers.uploaddocs);

router.patch('/update', 
    fileUpload.single('profile'),
    [
        check('username').notEmpty(), 
        check('phone').isMobilePhone(),
        check('age').isNumeric(),
        check('gender').notEmpty()
    ], processControllers.updateUser
);

router.patch('/changePassword', [
        check('oldpassword').isLength({min:6}),
        check('newpassword').isLength({min:6}),
    ], processControllers.changePassword
);

router.delete('/remove', processControllers.deleteUser);


module.exports = router;