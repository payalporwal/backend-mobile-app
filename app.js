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

const authRouter = require('./server/routes/auth-routes');
const processRouter = require('./server/routes/process-routes');
const tokenRouter = require('./server/routes/token-routes');
const otpRouter = require('./server/routes/otp-route');
const notiRouter = require('./server/routes/notification');
const callsRouter = require('./server/routes/call-routes');

const HttpError = require('./utils/http-error');

const config =  require('./config.js');
require('./database/db');

console.log(`Node Environment is ${process.env.NODE_ENV}`);


const app = express();
app.use(express.json());
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.use(cors());

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
app.use('/api/notification', notiRouter);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', false, 404);
    throw error;
});

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

if(process.env.NODE_ENV=== 'production'){
https
  .createServer(
		// Provide the private and public key to the server by reading each
		// file's content with the readFileSync() method.
    {
      key: fs.readFileSync(  process.env.SSL_DIRECTORY +  "backend.ssl.d/server.paceful.org.key"),
      cert: fs.readFileSync(  process.env.SSL_DIRECTORY + "backend.ssl.d/server.paceful.org.crt"),
    },
    app
  )
  .listen(config.PORT, config.HOST, () => {
    console.log(`Server running on https://${config.HOST}:${config.PORT}`);
})
} else if(process.env.NODE_ENV=== 'test'){
  https
  .createServer(
		// Provide the private and public key to the server by reading each
		// file's content with the readFileSync() method.
    {
      key: fs.readFileSync( process.env.SSL_DIRECTORY + "server-test.ssl.d/test.paceful.org.key"),
      cert: fs.readFileSync(  process.env.SSL_DIRECTORY + "server-test.ssl.d/test.paceful.org.crt"),
    },
    app
  )
  .listen(config.PORT, config.HOST, () => {
    console.log(`Server running on https://${config.HOST}:${config.PORT}`);
})
} else {
    app.listen(config.PORT, config.HOST, () => {
        console.log(`Server running on http://${config.HOST}:${config.PORT}`);
    })
}

