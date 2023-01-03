const express = require('express');

const tokenControllers = require('../controllers/token-controller');

const router = express.Router();

router.post('/refresh', tokenControllers.getnewToken);

router.delete('/logout', tokenControllers.logoutUser);

module.exports = router;
