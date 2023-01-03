const express = require('express');
const { check } = require('express-validator');

const checkAuth = require('../middleware/check_auth');
const processControllers = require('../controllers/process-controllers');

const router = express.Router();

router.use(checkAuth);

router.get('/email', check('email').isEmail(), checkAuth, processControllers.getUserbyEmail);

router.get('/dashboard', processControllers.getUserbyId);

router.patch('/update', [
    check('username').not().isEmpty(), 
    check('phone').isMobilePhone(),
    check('age').isNumeric(),
    check('gender').not().isEmpty()
], processControllers.updateUser);

router.delete('/remove', check('token').not().isEmpty, processControllers.deleteUser);


module.exports = router;