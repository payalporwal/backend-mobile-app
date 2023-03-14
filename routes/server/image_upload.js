const upload = require("../../middleware/multer");
const cloudinary = require("../../middleware/cloudinary");
const router = require("express").Router();
const checkAuth = require("../../middleware/check_auth");
const User = require("../../models/user");
const HttpError = require("../../utils/http-error");

router.use(checkAuth);

router.post("/upload", upload.single("images"), async (req, res, next) => {
    try {
        // Upload image to cloudinary
        const {type} = req.body;
        if(!req.file){
            return next(new HttpError('Please upload a image', false, 422));
        }
        const files = await cloudinary.uploader.upload(req.file.path);
        // find user
        const user = await User.findById(req.user.id);
        const path = files.secure_url;
        // check type
        if(type === 'profile') {
            user.profile = {
                contentType: req.file.mimetype,
                path: path
            };
        } else if(type === 'verifydoc') {
            user.verifydoc = {
                contentType: req.file.mimetype,
                path: path
            };
        } else {
            return next(new HttpError("Please provide valid 'type' of request", false, 422));
        }

        // save user
        await user.save();
        res.status(200).json({ message: "Image uploaded successfully", success: true, path});
    } catch (err) {
        console.log(err);
        return next(new HttpError(err.message, false, 500));
    }
});

module.exports = router;
        
        