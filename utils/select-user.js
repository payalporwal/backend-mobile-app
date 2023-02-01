const User = require('../models/user');

module.exports = async (userId) => {
    try {
        const userlist = User.find({completedDoc: true, _id: { $ne: userId }}).sort({email:-1,createdAt:-1, updatedAt:-1});

        return userlist[0];
    } catch (err) {
		return next(new HttpError('Try Again', false, 400));
	}
};