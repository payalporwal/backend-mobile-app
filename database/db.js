const mongoose = require('mongoose');
const config = require('../config');

mongoose.set('strictQuery', true);
module.exports = mongoose
    .connect(config.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.log('Database Connection Failed!!')
        console.log(err);
        process.exit(1);
    });