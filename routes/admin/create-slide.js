const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timeStamp = require('../../utils/timestamp');
const slideSchema = new Schema({
    slidedata: { type: String, required: true  },
    slideno: { type: Number, required: true},
    duration: { type:Number, required: true },
    createdAt: { type: Date, default: timeStamp }
});
const router = require('express').Router(); 


const Slide = mongoose.model('slide', slideSchema);

// create slide data 
router.post('/create-slide', async (req, res, next) => {
    const slide = new Slide({
        slidedata: req.body.slidedata,
        slideno: req.body.slideno,
        duration: req.body.duration
    });
    try{
        await slide.save();
        res.status(201).json({message: 'Saved Successfully', success: true});
    }
    catch(error){
        console.log(error);
        return next(error);
    }
});

// get slide data
router.get('/get-slide', async (req, res, next) => {
    try{
        const slide = await Slide.find().select('slidedata slideno');
        res.status(200).json({slide: slide});
    } catch(error){
        console.log(error);
        return next(error);
    }
}
);

module.exports = router;