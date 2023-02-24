const router = require('express').Router();
const User = require('../models/user');
const docQuestion = require('../../models/docQuestions');
const HttpError = require('../../utils/http-error');
const check_auth = require('../../middleware/check_auth');

router.use(check_auth);

router.post('/skillsset', async (req, res, next) => {
    try{
        const user = await User.findById(req.userData.userId);
        const questions = await docQuestion.find({user: user}).populate('user');
        if(!questions ){
            const quests =  new docQuestion({ user: user, skillset: req.body});
            await quests.save();
            quests.populate('user');
            return res.status(201).json({message: 'Saved Successfully', success: true});
        }
        questions.skillset = req.body;
        await questions.save();
        return res.status(200).json({message: 'Saved Successfully', success: true});
    } catch(err){
        return next(new HttpError('Something went wrong, Could not Save!', false, 500));
    }
});

router.post('/question', async (req, res, next) => {
    try{
        const user = await User.findById(req.userData.userId);
        const questions = await docQuestion.find({user: user}).populate('user');
        if(!questions ){
            const quests =  new docQuestion({ user: user, questionaire: req.body});
            await quests.save();
            quests.populate('user');
            return res.status(201).json({message: 'Saved Successfully', success: true});
        }
        questions.questionaire = req.body;
        await questions.save();
        return res.status(200).json({message: 'Saved Successfully', success: true});
    } catch(err){
        return next(new HttpError('Something went wrong, Could not Save!', false, 500));
    }
});

