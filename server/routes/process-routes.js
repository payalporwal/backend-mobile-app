const express = require('express');
const { check } = require('express-validator');

const checkAuth = require('../middleware/check_auth');
const processControllers = require('../controllers/process-controllers');

const router = express.Router();

router.use(checkAuth);


router.get('/email', check('email').isEmail(), processControllers.getUserbyEmail);

router.get('/dashboard', processControllers.getUserbyId);

router.post('/slideupdate', [check('slideno').isNumeric(), check('completedDoc').isBoolean()] ,processControllers.updateSlide);

router.post('/supportrequest', processControllers.supportRequest);

router.post('/feedback', processControllers.feedback);

router.patch('/update', [
    check('username').notEmpty(), 
    check('phone').isMobilePhone(),
    check('age').isNumeric(),
    check('gender').notEmpty()
], processControllers.updateUser);

router.patch('/changePassword', [
    check('oldpassword').isLength({min:6}),
    check('newpassword').isLength({min:6}),
], processControllers.changePassword);

router.delete('/remove', processControllers.deleteUser);


module.exports = router;