const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');


const authRouter = require('./routes/auth-routes');
const processRouter = require('./routes/process-routes');
const tokenRouter = require('./routes/token-routes');
const otpRouter = require('./routes/otp-route');
const notiRouter = require('./routes/notification');
const callsRouter = require('./routes/call-routes');
//const googleRouter = require('./routes/googleauth-route');

const HttpError = require('./utils/http-error');

const config =  require('./config.js');
require('./database/db');

console.log(`Node Environment is ${process.env.NODE_ENV}`);


const app = express();
app.use(express.json());
app.use(bodyParser.json());

/*
app.use(session({
  secret:"My user database secret.",
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

*/

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader("Access-Control-Allow-Credentials", 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

// google auth
//app.use('/', googleRouter);


//for app login signup and others
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
    if(res.headerSent) {
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
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem')
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
      key: fs.readFileSync("../../../../../etc/nginx-rc/conf.d/server-test.ssl.d/test.paceful.org.key"),
      cert: fs.readFileSync("../../../../../etc/nginx-rc/conf.d/server-test.ssl.d/test.paceful.org.crt"),
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