const jwt = require('jsonwebtoken');
require('dotenv').config();

const HttpError = require('../../utils/http-error');


module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new HttpError('Authentication failed!, Provide valid Token', false, 404);
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY);
    req.userData = { userId: decodedToken.userId, email: decodedToken.email };
    
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', false, 403);
    return next(error);
  }
};