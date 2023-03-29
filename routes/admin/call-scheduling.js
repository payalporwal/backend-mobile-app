const router = require('express').Router();

const HttpError = require('../../utils/http-error');
const User = require('../../models/user');
const callmodel = require('../../models/calls');
const sendmail = require('../../utils/email/send');
const checkAuth = require('../../middleware/check_auth');
const sendmail = require('../../utils/email/send');


router.use(checkAuth);
// get all users who have completedDoc true
router.get('/get-all-users', async (req, res, next) => {
    let users;
    try {
        users = await User.find({ completedDoc: true });
        res.status(200).json({ message: 'All Users are here' , success:true, users});
    } catch (err) {
        const error = new HttpError(
        'Fetching users failed, please try again later.', false,
        500
        );
        return next(error);
    }
    }
);

// all call slots where call model have listener user null
router.get('/get-all-call-slots', async (req, res, next) => {
    let calls;
    try {
        calls = await callmodel.find({ listener: null });

        res.status(200).json({ message: 'All call slots are here' , success:true, calls});
    } catch (err) {
        const error = new HttpError('Fetching calls failed, please try again later.', false, 500 );
        return next(error);
    }
    }
);

// assign listener user to a call slot by id
router.post('/assign-listener/:id', async (req, res, next) => {
    try{
        const slot = await callmodel.findById(req.params.id);
        if(!slot){
            const error = new HttpError('No call slot found', false, 404);
            return next(error);
        }
        const user = await User.findById(listenerid)
        slot.listenerUser = user;
        await slot.save();
        slot.populate('listenerUser');
        res.status(200).json({ message: 'Listener assigned to call slot' , success:true, slot});
    }catch(err){
        const error = new HttpError('Something went wrong', false, 500);
        return next(error);
    }
});

// send email to listener user
router.post('/send-email/:id', async (req, res, next) => {
    try{
        const slot = await callmodel.findById(req.params.id);
        if(!slot){
            const error = new HttpError('No call slot found', false, 404);
            return next(error);
        }
        const user = await User.findById(slot.listenerUser);
        const email = user.email;
        const name = slot.listenerUser.name;
        const date = slot.date;
        const time = slot.time;
        const { email_message, email_subject } = req.body;
        await sendmail(email_message, email_subject, email, type);
        res.status(200).json({message: "Mail done", success: true});
    } catch(error){
        return next(error, error.status);
    }
});