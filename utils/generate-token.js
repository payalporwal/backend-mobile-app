const jwt = require('jsonwebtoken');

const UserToken = require('../models/token');
const HttpError = require('./http-error');

require('dotenv').config();

module.exports = async (user) => {
	try {
		const payload = { userId: user.id, email: user.email };
		const accessToken = jwt.sign(
			payload,
			process.env.ACCESS_TOKEN_PRIVATE_KEY,
			{ expiresIn: "10m" }
		);
		const refreshToken = jwt.sign(
			payload,
			process.env.REFRESH_TOKEN_PRIVATE_KEY,
			{ expiresIn: "2d" }
		);

		const userToken = await UserToken.findOne({ userId: user.id });
		if (userToken) await userToken.remove();

		await new UserToken({ userId: user.id, token: refreshToken }).save();
		return accessToken;
	} catch (err) {
		return next(new HttpError('Something went wrong, Token not created', false, 400));
	}
};
