const multer = require('multer');
const fs = require('fs');
const timeStamp = require('../utils/timestamp');
const HttpError = require('../utils/http-error');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/gif': 'gif'
};

module.exports = multer({
  limits: {
    fileSize: 5*1024*1024,
  },
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new HttpError('Invalid image type!,Only jpg, jpeg, png, gif files are allowed', false , 400);
    cb(error, isValid);
  }
});

