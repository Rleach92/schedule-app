// backend/routes/pto.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const managerAuth = require('../middleware/managerAuth');
const PtoRequest = require('../models/PtoRequest');
const CalendarEvent = require('../models/CalendarEvent');
const Notification = require('../models/Notification'); // 1. Import Notification
const User = require('../User'); // 1. Import User

// --- New Helper Function to notify managers ---
const notifyAllManagers = async (message, link) => {
  try {
    const managers = await User.find({ role: 'manager' }).select('_id');
    if (!managers) return;
    
    const notifications = managers.map(manager => ({
      user: manager._id,
      message,
      link
    }));
    
    await Notification.insertMany(notifications);
  } catch (err) {
    console.error('Error notifying managers:', err);
  }
};
// ---------------------------------------------

// @route   POST /api/pto
// @desc    Create a new PTO request
// @access  Private (All employees)
router.post('/', auth, async (req, res) => {
  const { date, reason } = req.body;
  const requestedDate = new Date(date);
  
  try {
    // 1. Check if this date is restricted
    const event = await CalendarEvent.findOne({
      date: requestedDate,
      type: 'PTO_RESTRICTED'
    });

    if (event) {
      return res.status(400).json({ msg: `This date (${event.title}) is restricted from PTO requests.` });
    }

    // 2. Check if user already requested this day
    const existingRequest = await PtoRequest.findOne({
      user: req.user.id,
      date: requestedDate
    });

    if (existingRequest) {
      return res.status(400).json({ msg: 'You have already submitted a request for this date.' });
    }

    // 3. Create the new request
    const newRequest = new PtoRequest({
      user: req.user.id,
      userName: req.user.name,
      date: requestedDate,
      reason
    });

    await newRequest.save();
    res.status(201).json(newRequest);

    // 2. --- TRIGGER NOTIFICATION ---
    const formattedDate = requestedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    notifyAllManagers(
      `${req.user.name} submitted a PTO request for ${formattedDate}.`,
      '/pto'
    );
    // ----------------------------

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/pto/my-requests
// (No change to this route)
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await PtoRequest.find({ user: req.user.id }).sort({ date: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/pto/pending
// (No change to this route)
router.get('/pending', managerAuth, async (req, res) => {
  try {
    const requests = await PtoRequest.find({ status: 'pending' }).sort({ date: 1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/pto/respond/:id
// @desc    Approve or deny a PTO request
// @access  Manager Only
router.put('/respond/:id', managerAuth, async (req, res) => {
  const { status } = req.body; // 'approved' or 'denied'

  if (status !== 'approved' && status !== 'denied') {
    return res.status(400).json({ msg: 'Invalid status.' });
  }

  try {
    let request = await PtoRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ msg: 'This request has already been actioned.' });
    }

    request.status = status;
    request.managedBy = req.user.id;
    await request.save();

    res.json(request);

    // 3. --- TRIGGER NOTIFICATION ---
    try {
      const formattedDate = new Date(request.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const newNotif = new Notification({
        user: request.user,
        message: `Your PTO request for ${formattedDate} was ${status} by a manager.`,
        link: '/pto'
      });
      await newNotif.save();
    } catch (err) {
      console.error('Error creating PTO response notification:', err);
    }
    // ----------------------------

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;