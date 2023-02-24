const router = require('express').Router();
const HttpError = require('../../utils/http-error');
const userSchema = require('../../models/admin');
const generateTokens = require('../../utils/generate-token');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

router.get('/getall', async (req, res, next) => {
    try{
        const users = await userSchema.find().select({ username: 1, email: 1, role: 1});
        res.json({ message: 'All users are here' , success:true, users});
    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
});

//later on when many people to access admin, then let them create account and give them roles accordingly

router.post('/create', body('email').isEmail().normalizeEmail() ,async (req, res, next) => {
    try{
        const error = validationResult(req);
        if(!error.isEmpty()) {
            return next( new HttpError('Invalid inputs passed, Recheck', false, 422));
        }

        const {username, email, password, role} = req.body;
        const user = await userSchema.findOne({email: email});
        if(user){
            return next(new HttpError('User already exists, Login Instead', false, 422));
        }
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser =  new userSchema({username: username, email: email, password: hashedPassword, role: role});
        await newUser.save();
        res.status(201).json({message: 'Admin Panel User Created!', success: true});
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
});

router.post('/login', body('email').isEmail().normalizeEmail(), async (req, res, next) => {
    try{
        const error = validationResult(req);
        if(!error.isEmpty()) {
            return next( new HttpError('Invalid inputs passed, Recheck', false, 422));
        }

        const { email, password } = req.body;
        const user = await userSchema.findOne({email: email});
        if(!user){
            return next(new HttpError('User not Found', false, 403));
        }
        let isValidPassword = false;
        isValidPassword = await bcrypt.compare(password, user.password);
        if(!isValidPassword){
            return next(new HttpError('Invalid credentials, Check your Password', false, 403));
        }
        const accessToken = await generateTokens(user);
        res.json({ message: 'Logged In Successfully!', success: true, token: accessToken });
    } catch (err){
        console.log(err);
        return next(new HttpError('Logging in failed, please try again later.', false, 500));
    }
});

router.post('/forgetpass',  body('email').isEmail().normalizeEmail(), async (req, res, next) => {
    try{
        const error = validationResult(req);
        if(!error.isEmpty()) {
            return next( new HttpError('Invalid inputs passed, Recheck', false, 422));
        }
        const {email, password} = req.body;
        const user = await userSchema.findOne({email: email});
        if(!user){
            return next(
            new HttpError('User doesn\'t exists, please check your data.', false, 422)
        );
        }
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({message: 'Password changes successfully!', success: true});
    } catch (err) {
        return next( new HttpError('Something went wrong', false, 500));
    }
});

module.exports = router;