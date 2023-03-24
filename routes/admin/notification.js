const express = require('express');
const router = express.Router();
const { sendNotification, sendNotificationToMultiple } = require('../../utils/fcm-helper');

router.post('/send-notification', async (req, res) => {
    const { title, body, token } = req.body;
  
    if (!title || !body || !token) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
  
    try {
      await sendNotification(title, body, token);
      res.status(200).json({ message: 'Notification sent' });
    } catch (error) {
      res.status(500).json({ message: 'Error sending notification', error });
    }
});

router.post('/send-notification-multiple', async (req, res) => {
  const { title, body, tokens } = req.body;

  if (!title || !body || !tokens || !Array.isArray(tokens)) {
    return res.status(400).json({ message: 'Missing or invalid required parameters' });
  }

  try {
    await sendNotificationToMultiple(title, body, tokens);
    res.status(200).json({ message: 'Notifications sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending notifications', error });
  }
});