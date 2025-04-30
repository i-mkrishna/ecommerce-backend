const express = require('express');
const Subscriber = require('../models/Subscriber');

const router = express.Router();

// @route POST /api/subscribe
// @desc Handle newsletter subscription
// @access Public

router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    // Check if the email is already subscribed
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    // Create a new subscriber
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    res.status(201).json({ message: 'Subscription successful' });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;