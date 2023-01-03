const express = require('express');
const bodyParser = require('body-parser');

const userRouter = require('./routes/auth-routes');
const processRouter = require('./routes/process-routes');
const tokenRouter = require('./routes/token-routes');
const HttpError = require('./utils/http-error');

const config =  require('./config.js');
require('./database/db');
console.log(`Node Environment is ${process.env.NODE_ENV}`);


const app = express();


app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
  });

app.use('/api/users',userRouter);
app.use('/api/process',processRouter);
app.use('/api/token',tokenRouter);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', false, 404);
    throw error;
});

app.use((error, req, res, next) => {
    if(res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'Unknown Error!!', success: error.success});
});


app.listen(config.PORT, config.HOST, () => {
    console.log(`Server running on http://${config.HOST}:${config.PORT}`);
})
