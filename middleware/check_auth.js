const jwt = require('jsonwebtoken');
require('dotenv').config();

const HttpError = require('../utils/http-error');


module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Set CORS headers for OPTIONS request
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "500");
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS");
    return res.status(200).send();
  }
  try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new HttpError('Authentication failed!, Provide valid Token', false, 404);
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY);
    req.user = { id: decodedToken.userId, email: decodedToken.email };
    
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', false, 403);
    return next(error);
  }
};