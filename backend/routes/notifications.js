// backend/routes/notifications.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get all unread notifications for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
      read: false
    }).sort({ createdAt: -1 }); // Show newest first
    
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/notifications/read/:id
// @desc    Mark a specific notification as read
// @access  Private
router.put('/read/:id', auth, async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    // Ensure the user owns this notification
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;