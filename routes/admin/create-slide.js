const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timeStamp = require('../../utils/timestamp');
const slideSchema = new Schema({
    slidedata: { type: String, required: true  },
    createdAt: { type: Date, default: timeStamp }
});
const router = require('express').Router(); 


const Slide = mongoose.model('slide', slideSchema);

// create slide data 
router.post('/create-slide', async (req, res, next) => {
    const slide = new Slide({
        slidedata: req.body.slidedata
    });
    try{
        await slide.save();
        res.status(201).json({message: 'Saved Successfully', success: true});
    }
    catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Could not Save!', false, 500));
    }
});

// get slide data
router.get('/get-slide', async (req, res, next) => {
    try{
        const slide = await Slide.find();
        res.status(200).json({slide: slide});
    } catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong, Could not Save!', false, 500));
    }
}
);

module.exports = router;