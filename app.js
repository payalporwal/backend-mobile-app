const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const cors =  require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');

const authRouter = require('./routes/server/auth-routes');
const processRouter = require('./routes/server/process-routes');
const tokenRouter = require('./routes/server/token-routes');
const otpRouter = require('./routes/server/otp-route');
const callsRouter = require('./routes/server/call-routes');
const adminRouter = require('./routes/admin/admin-routes');
const blogRouter = require('./routes/admin/blog-routes');

const HttpError = require('./utils/http-error');

const config =  require('./config.js');
require('./database/db');

console.log(`Node Environment is ${process.env.NODE_ENV}`);


const app = express();
app.use(express.json());
app.use(bodyParser.json());

app.set('view engine', 'ejs');

// Allow Cross-Origin requests
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

//for app login signup 
app.use('/api/users',authRouter);

//web login signup
app.use('/api/web', authRouter);

//common
app.use('/api/process',processRouter);
app.use('/api/healercall', callsRouter);
app.use('/api/token',tokenRouter);
app.use('/api/otp',otpRouter);


//admin
app.use('/api/admin',adminRouter);
app.use('/api/blog',blogRouter);


// no route
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', false, 404);
    throw error;
});

// error handler
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
    res.status(error.code || 500);
    res.json({message: error.message || 'Unknown Error!!', success: error.success});
});

if(process.env.NODE_ENV === 'development'){
    app.listen(config.PORT, config.HOST, () => {
        console.log(`Server running on http://${config.HOST}:${config.PORT}`);
    })
} else {
  https
    .createServer(
      // Provide the private and public key to the server by reading each
      // file's content with the readFileSync() method.
      {
        key: fs.readFileSync( config.key ),
        cert: fs.readFileSync(  config.cert ),
      },
      app
    )
    .listen(config.PORT, config.HOST, () => {
      console.log(`Server running on https://${config.HOST}:${config.PORT}`);
  })
}