const router = require('express').Router();
const User = require('../../models/user');
const docQuestion = require('../../models/docQuestions');
const HttpError = require('../../utils/http-error');
const checkAuth = require('../../middleware/check_auth');
const adminUser =  require('../../models/admin');
const supportRequest = require('../../models/support');
const sendmail = require('../../utils/email/send');


router.use(checkAuth);

// used by admin panel users to review answers
router.get('/getall/assessment',  async (req, res, next) => {
    try{
        const user = await adminUser.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'content')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const assessment = await docQuestion.find({questionairepass : {$ne : 'PASS'}}).populate({
            path: 'user',
            select: 'username age gender'
        }).select({user:1, questionaire: 1 , skillset: 1});
        if(!assessment){
            return next(new HttpError('No assessment found!', false, 404));
        }
        res.status(200).json({message: 'Assessments Here', success: true, assessment});
    }
    catch(error){
        console.log(error);
        return next(error);
    }
});

// mark skills as pass
router.post('/pass/:id',  async (req, res, next) => {
    try{
        const user = await adminUser.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'content')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const assessment = await docQuestion.findById(req.params.id);
        const { result, field, email_message, email_subject } = req.body;
        if( !result || !field ){
            return next(new HttpError('Please provide all fields', false, 422));
        }
        if(!assessment){
            return next(new HttpError('No assessment found!', false, 404));
        } 
        if(field === 'skillset'){
            assessment.skillsetpass = result;
        }
        else if(field === 'questionaire'){
            assessment.questionairepass = result;
        }
        await sendmail(email_message, email_subject, assessment.email, 'support');
        await assessment.save();
        res.status(200).json({message: 'Evaluation Done', success: true});
    }
    catch(error){
        console.log(error);
        return next(error);
    }
});

// get all support requests 
router.get('/getall/support',  async (req, res, next) => {
    try{
        const user = await adminUser.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'support')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const support = await supportRequest.find({resolved: false}).select({ username:1, text:1  });
        if(!support){
            return next(new HttpError('No Requests at the moment', false, 404));
        }
        res.status(200).json({message: 'Support Here', success: true, support});
    }
    catch(error){
        console.log(error);
        return next(error);
    }
});

// mark support request as resolved
router.post('/support/:id',  async (req, res, next) => {
    try{
        const user = await adminUser.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin' || role === 'support')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const { email_message, email_subject } = req.body;
        const support = await supportRequest.findById(req.params.id, {resolved: false});
        if(!support){
            return next(new HttpError('No Request found!', false, 404));
        }
        await sendmail(email_message, email_subject, support.email, 'support');
        support.resolved = true;
        await support.save();
        res.status(200).json({message: 'Support Resolved', success: true});
    }
    catch(error){
        console.log(error);
        return next(error);
    }
});

// get all verifydoc
router.get('/getall/verify/user-documents',  async (req, res, next) => {
    try{
        const user = await adminUser.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const verifydoc = await User.find({verifydoc: {$ne : null}}).select({username:1, verifydoc:1});
        if(!verifydoc){
            return next(new HttpError('No verifydoc found!', false, 404));
        }
        res.status(200).json({message: 'Verifydoc Here', success: true, verifydoc});
    }
    catch(error){
        console.log(error);
        return next(error);
    }
});

// mark reviewed docs
router.post('/verify/user-documents/:id',  async (req, res, next) => {
    try{
        const user = await adminUser.findById(req.user.id);
        const role = user.role;
        if(!(role === 'admin')){
            return next(new HttpError('You are not authorized for this action', false, 401));
        }
        const { review, email_message, email_subject } = req.body;
        const verifydoc = await User.findById(req.params.id).select({username:1, verifydoc:1, email:1});
        if(!verifydoc){
            return next(new HttpError('No verifydoc found!', false, 404));
        }
        if(review === 'reject'){
            verifydoc.verifydoc = null;
        }
        else if(review === 'accept'){
            verifydoc.verified = true;
        }
        await sendmail(email_message, email_subject, verifydoc.email,  'support');
        await verifydoc.save();
        res.status(200).json({message: 'User Documents Verified', success: true});
    }   
    catch(error){
        console.log(error);
        return next(error);
    }
});


module.exports = router;
