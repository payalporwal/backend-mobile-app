var admin = require("firebase-admin");

var serviceAccount = require("./pace-mvp-firebase-adminsdk-u21ga-15e68d22d5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendNotification(title, body, token) {
  const message = {
    notification: {
      title,
      body,
    },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.log('Error sending message:', error);
  }
}

async function sendNotificationToMultiple(title, body, tokens) {
  const message = {
    notification: {
      title,
      body,
    },
    tokens,
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log('Successfully sent messages:', response);
  } catch (error) {
    console.log('Error sending messages:', error);
  }
}

module.exports = {
  sendNotification,
  sendNotificationToMultiple,
};
