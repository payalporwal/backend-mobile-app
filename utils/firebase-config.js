var admin = require("firebase-admin");

var serviceAccount = require("./pace-mvp-firebase-adminsdk-u21ga-15e68d22d5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports.admin = admin