const express = require('express');
const { check } = require('express-validator');

const checkAuth = require('../middleware/check_auth');
const processControllers = require('../controllers/process-controllers');

const router = express.Router();

router.use(checkAuth);

const nocache = (req, res, next) => {
    res.header('Cache-Control', 'private , no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}


router.get('/email', check('email').isEmail(), processControllers.getUserbyEmail);

router.get('/dashboard', processControllers.getUserbyId);

router.get('/rtc/:channel/:role/:tokentype', nocache, processControllers.generateAgoraToken);

router.post('/supportrequest', [
    check('text').notEmpty(), 
    check('type').notEmpty(), 
], processControllers.supportRequest);

router.post('/feedback', [
    check('text').notEmpty(), 
    check('type').notEmpty(), 
], processControllers.feedback);

router.patch('/update', [
    check('username').notEmpty(), 
    check('phone').isMobilePhone(),
    check('age').isNumeric(),
    check('gender').notEmpty(),
   check('slideno').isNumeric()
], processControllers.updateUser);

router.patch('/changePassword', [
    check('oldpassword').isLength({min:6}),
    check('newpassword').isLength({min:6}),
], processControllers.changePassword);

router.delete('/remove', processControllers.deleteUser);


module.exports = router;