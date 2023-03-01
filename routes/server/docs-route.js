const router = require('express').Router();
const User = require('../../models/user');
const docQuestion = require('../../models/docQuestions');
const HttpError = require('../../utils/http-error');
const checkAuth = require('../../middleware/check_auth');



// create documnent slide


router.post('/skillset', checkAuth ,async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id);
        const questions = await docQuestion.findOne({user: user}).populate({
            path: 'user',
            select: 'username age gender'
        });
      
        if(questions ){
           
            questions.skillset = req.body.skillset;
            await questions.save();
            return res.status(200).json({message: 'Saved Successfully', success: true});
        }
        const quests =  new docQuestion({ user: user, skillset: req.body.skillset}); 
        await quests.save();
        quests.populate({
            path: 'user',
            select: 'username age gender'
        });
        res.status(201).json({message: 'Saved Successfully', success: true});
    } catch(err){
        console.log(err);   
        return next(new HttpError('Something went wrong, Could not Save!', false, 500));
    }
});

router.post('/question',checkAuth, async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id);
        const questions = await docQuestion.findOne({user: user}).populate({
            path: 'user',
            select: 'username age gender'
        });
        if(!questions){
            const quests =  new docQuestion({ user: user, questionaire: req.body.questionaire});
            await quests.save();
            quests.populate({
            path: 'user',
            select: 'username age gender'
        });
            return res.status(201).json({message: 'Saved Successfully', success: true});
        }
        questions.questionaire = req.body.questionaire;
        await questions.save();
        return res.status(200).json({message: 'Saved Successfully', success: true});
    } catch(err){
        return next(new HttpError('Something went wrong, Could not Save!', false, 500));
    }
});
/*
router.get('/get/question', checkAuth, async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id);
        const questions = await docQuestion.findOne({user: user}).populate({
            path: 'user',
            select: 'username age gender'
        }).select({questionaire:1});
        if(!questions){
            return next(new HttpError('No questionaire found!', false, 404));
        }
        res.status(200).json({message: 'Questionaire found', success: true, questions: questions});
    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
});

router.get('/get/skillset', checkAuth, async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id);
        const skillsets = await docQuestion.findOne({user: user}).populate({
            path: 'user',
            select: 'username age gender'
        }).select({skillset:1});
        if(!skillsets){
            return next(new HttpError('No skillsets found!', false, 404));
        }
        res.status(200).json({message: 'Skillsets found', success: true, skillsets: skillsets});
    } catch(err){
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
});

*/

//get all answers with users
router.get('/getall/assessment', async (req, res, next) => {
    try{
        const assessment = await docQuestion.find({questionairepass : {$ne : 'PASS'}}).populate({
            path: 'user',
            select: 'username age gender'
        }).select({user:1, questionaire: 1 , skillset: 1});
        if(!assessment){
            return next(new HttpError('No assessment found!', false, 404));
        }
        res.status(200).json({message: 'Assessments Here', success: true, assessment});
    }
    catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
});

// mark skills as pass
router.post('/pass/:id', checkAuth, async (req, res, next) => {
    try{
        const assessment = await docQuestion.findById(req.params.id);
        const { result, field } = req.body;
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
        else{
            return next(new HttpError('Invalid field', false, 422));
        }
        await assessment.save();
        res.status(200).json({message: 'Evaluation Done', success: true});
    }
    catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
});



module.exports = router;