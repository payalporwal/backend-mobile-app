const express = require('express');
const { check } = require('express-validator');

const checkAuth = require('../middleware/check_auth');
const callControllers = require('../controllers/calls-controllers');

const router = express.Router();

router.use(checkAuth);

const nocache = (req, res, next) => {
    res.header('Cache-Control', 'private , no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}

//making calls

router.get('/talkslots', callControllers.getslotsfortalk);

router.get('/hearslots', callControllers.getslotsforhear);

router.post('/slotbook', [check('strength').isNumeric(), check('datetime').isNumeric(), check('note').notEmpty()], callControllers.slotbook);

router.post('/agora/calltoken', [ check('channel').isString(), check('slotid').notEmpty(), check('expiry').isString()] ,nocache, callControllers.getCallToken);

router.post('/cutcall', [check('slotid').notEmpty()], callControllers.cuttingCall);

module.exports = router;