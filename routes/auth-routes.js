const express = require('express');
const { check } = require('express-validator');

const userControllers = require('../controllers/auth-controllers');
const checkAuth = require('../middleware/check_auth');

const router = express.Router();


router.post('/register', [
    check('username').not().isEmpty(), 
    check('email').normalizeEmail().isEmail(), 
    check('password').isLength({min:6}),
    check('age').isNumeric(),
    check('gender').not().isEmpty(),
], userControllers.register
);


router.post('/login', userControllers.login);

module.exports = router;