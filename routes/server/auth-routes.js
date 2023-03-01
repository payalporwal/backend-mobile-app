const express = require('express');
const { check } = require('express-validator');

const userControllers = require('../../controllers/server/auth-controllers');

const router = express.Router();


router.post('/register', [
    check('username').notEmpty(), 
    check('email').normalizeEmail().isEmail(), 
    check('password').isLength({min:6}),
    check('age').isNumeric(),
    check('gender').notEmpty(),
], userControllers.register
);

router.post('/login', [
    check('email').normalizeEmail().isEmail(), 
    check('password').isLength({min:6}),
    //check('devicetoken').notEmpty(),
], userControllers.login);

router.patch('/forgetPassword', [
    check('email').normalizeEmail().isEmail(), 
    check('password').isLength({min:6})
], userControllers.forgetPassword);

module.exports = router;