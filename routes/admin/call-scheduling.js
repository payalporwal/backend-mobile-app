const router = require('express').Router();

const HttpError = require('../../utils/http-error');
const User = require('../../models/user');
const adminUser =  require('../../models/admin');
const callmodel = require('../../models/calls');
const sendmail = require('../../utils/email/send');
const checkAuth = require('../../middleware/check_auth');


router.use(checkAuth);
// get all users who have completedDoc true
router.get('/get-all-users', async (req, res, next) => {
    try {
        const user = await adminUser.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'support')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const users = await User.find({ completedDoc: true, verified: true, active:true }).select({username:1, email:1, age:1, gender:1, completedDoc:1, verified:1});
        res.status(200).json({ message: 'All Users are here' , success:true, users});
    } catch(error){
        console.log(error);
        return next(error);
    }
    }
);

// all call slots where call model have listener user null
router.get('/get-all-call-slots', async (req, res, next) => {
    try {
        const user = await adminUser.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'support')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }

        const calls = await callmodel.find({ listenerUser: null }).select({date: 1, listenerUser: 1, strength: 1});
        res.status(200).json({ message: 'All call slots are here' , success:true, calls});
    } catch(error){
        console.log(error);
        return next(error);
    }
    }
);

// assign listener user to a call slot by id
router.post('/assign-listener/:id', async (req, res, next) => {
    try{
        const user = await adminUser.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'support')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const { email_message, email_subject, listenerid } = req.body;
        const slot = await callmodel.findById(req.params.id);
        if(!slot){
            const error = new HttpError('No call slot found', false, 404);
            return next(error);
        }
        const listeneruser = await User.findById({ _id: listenerid, active:true});
        slot.listenerUser = listeneruser;
        await slot.save();
        slot.populate({
            path: 'talkerUser listenerUser',
            select: 'username age gender'
        });
        const email = listeneruser.email;
        await sendmail(email_message, email_subject, email, 'support');
    
        
        res.status(200).json({ message: 'Listener assigned successfully' , success:true});
    } catch(error){
        console.log(error);
        return next(error);
    }
});

module.exports = router;