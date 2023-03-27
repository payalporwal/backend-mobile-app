const router = require('express').Router();
const User = require('../../models/user');
const docQuestion = require('../../models/docQuestions');
const checkAuth = require('../../middleware/check_auth');

router.use(checkAuth);
// create documnent slide
router.post('/skillset', async (req, res, next) => {
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
        const quests =  new docQuestion({ user: user, email: user.email, skillset: req.body.skillset}); 
        await quests.save();
        quests.populate({
            path: 'user',
            select: 'username age gender'
        });
        res.status(201).json({message: 'Saved Successfully', success: true});
    } catch(error){
        console.log(error);
        return next(error);
    }
});

router.post('/question', async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id);
        const questions = await docQuestion.findOne({user: user}).populate({
            path: 'user',
            select: 'username age gender'
        });
        if(!questions){
            const quests =  new docQuestion({ user: user, email: user.email, questionaire: req.body.questionaire});
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
    } catch(error){
        console.log(error);
        return next(error);
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
*/


module.exports = router;