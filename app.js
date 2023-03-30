const express = require('express');
const fs = require('fs');
const cors =  require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const authRouter = require('./routes/server/auth-routes');
const processRouter = require('./routes/server/process-routes');
const tokenRouter = require('./routes/server/token-routes');
const otpRouter = require('./routes/server/otp-route');
const callsRouter = require('./routes/server/call-routes');
const callAdminRouter = require('./routes/admin/call-scheduling');
const adminRouter = require('./routes/admin/admin-routes');
const blogRouter = require('./routes/admin/blog-routes');
const docRouter = require('./routes/server/docs-route');
const slideRouter = require('./routes/admin/create-slide');
const notiRouter = require('./routes/admin/notification');
const funcRouter = require('./routes/admin/admin-functions');
const HttpError = require('./utils/http-error');
const config =  require('./config.js');
require('./database/db');

console.log(`Node Environment is ${process.env.NODE_ENV}`);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.set('view engine', 'ejs');

// Allow Cross-Origin requests
const corsOptions = {
  origin: '*', // Allow all origins
  methods: 'PUT, POST, GET, DELETE, PATCH, OPTIONS', // Allowed methods
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization', // Allowed headers
  credentials: true,
  maxAge: 800,
};

app.use(cors(corsOptions));

// Set security HTTP headers
app.use(helmet());

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

app.use(hpp());

app.get('/', (req, res, next) => {
  res.send('Welcome to Pace!!')
});

app.use('/uploads', express.static('uploads'));

//for app login signup 
app.use('/api/users',authRouter);

//web login signup
app.use('/api/web', [ authRouter, slideRouter]);

//common
app.use('/api/process', processRouter);
app.use('/api/healercall', [callsRouter, callAdminRouter]);
app.use('/api/token',tokenRouter);
app.use('/api/otp',otpRouter);
app.use('/api/docs',docRouter);

//admin
app.use('/api/admin',[adminRouter, notiRouter, funcRouter]);
app.use('/api/blog',blogRouter);


// no route
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', false, 404);
    throw error;
});

// error handler
const mongoose = require('mongoose');

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'File size is too large, should be less than 5MB',
      success: false
    });
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      message: 'Too many files to upload. or Check image key name!',
      success: false
    });
  }

  // Check if the error is a Mongoose validation error
  if (error instanceof mongoose.Error.ValidationError) {
    const errorMessages = Object.values(error.errors).map(error => error.message);
    return res.status(400).json({
      message: `Validation error(s): ${errorMessages.join(', ')}`,
      success: false
    });
  }

  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'Unknown Error!!', success: error.success });
});


app.listen(config.PORT, () => console.log(` Nodejs Applications is listening on port ${config.PORT}!`));