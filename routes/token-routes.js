const express = require('express');

const tokenControllers = require('../controllers/token-controller');

const router = express.Router();

router.post('/refresh/:uid', tokenControllers.getnewToken);

router.delete('/logout/:uid', tokenControllers.logoutUser);

module.exports = router;
