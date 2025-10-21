// backend/routes/schedules.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const managerAuth =require('../middleware/managerAuth');

const Schedule = require('../models/Schedule');
const User = require('../User');
const Notification = require('../models/Notification');
const CalendarEvent = require('../models/CalendarEvent'); // Ensure this is imported

// --- Helper Function ---
const notifyAllEmployees = async (managerId, scheduleDate) => {
  try {
    const usersToNotify = await User.find({ _id: { $ne: managerId } }).select('_id');
    if (!usersToNotify || usersToNotify.length === 0) return; // Add check for empty array

    const formattedDate = new Date(scheduleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const notifications = usersToNotify.map(user => ({
      user: user._id,
      message: `A new schedule has been posted for the week of ${formattedDate}.`,
      link: '/schedule'
    }));
    await Notification.insertMany(notifications);
    console.log(`Sent ${notifications.length} schedule notifications.`);
  } catch (err) {
    console.error('Error creating schedule notifications:', err);
  }
};
// -----------------------

// @route   POST /api/schedules
router.post('/', managerAuth, async (req, res) => {
  const { weekStarting, days } = req.body;
  try {
    const scheduleFields = {
      weekStarting: new Date(weekStarting),
      days,
      uploadedBy: req.user.id
    };
    let schedule = await Schedule.findOneAndUpdate(
      { weekStarting: new Date(weekStarting) },
      { $set: scheduleFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(schedule); // Send response
    // Notify after sending response
    notifyAllEmployees(req.user.id, schedule.weekStarting);
  } catch (err) {
    console.error(`Error in POST /api/schedules: ${err.message}`); // Log error
    res.status(500).send('Server Error'); // Ensure response is sent on error
  }
});

// @route   GET /api/schedules/week
router.get('/week', auth, async (req, res) => {
  const { date } = req.query;
  console.log(`Backend received request for /week with date: ${date}`); // Add log
  try {
    const requestedDate = new Date(date);
    // Add validation for date if needed
     if (isNaN(requestedDate.getTime())) {
         console.error("Invalid date received:", date);
         return res.status(400).json({ msg: 'Invalid date format provided.' });
     }

    const schedule = await Schedule.findOne({ weekStarting: requestedDate });

    if (!schedule) {
      console.log(`No schedule found for week starting: ${requestedDate.toISOString()}`); // Add log
      // *** Explicitly send 404 ***
      return res.status(404).json({ msg: 'No schedule found for this week' });
    }

    console.log(`Schedule found for week starting: ${requestedDate.toISOString()}`); // Add log
    // *** Explicitly send 200 with data ***
    res.status(200).json(schedule);

  } catch (err) {
    console.error(`Error in GET /api/schedules/week: ${err.message}`); // Log error
    // *** Ensure response is sent on error ***
    res.status(500).send('Server Error');
  }
});


// @route   GET /api/schedules/month
router.get('/month', auth, async (req, res) => {
   const year = parseInt(req.query.year, 10);
   const month = parseInt(req.query.month, 10);
   if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
     return res.status(400).json({ msg: 'Valid year and month (1-12) are required.' });
   }
   try {
     const startDate = new Date(Date.UTC(year, month - 1, 1));
     const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
     const queryStartDate = new Date(startDate);
     queryStartDate.setUTCDate(queryStartDate.getUTCDate() - 6);

     const schedules = await Schedule.find({ weekStarting: { $gte: queryStartDate, $lte: endDate } }).sort({ weekStarting: 1 });
     const events = await CalendarEvent.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
     res.json({ schedules, events }); // Send response
   } catch (err) {
     console.error(`Error in GET /api/schedules/month: ${err.message}`); // Log error
     res.status(500).send('Server Error'); // Ensure response is sent on error
   }
});

// @route   GET /api/schedules/employees
router.get('/employees', managerAuth, async (req, res) => {
  try {
    const employees = await User.find({ role: { $in: ['employee', 'manager'] } }).select('_id name');
    res.json(employees); // Send response
  } catch (err) {
    console.error(`Error in GET /api/schedules/employees: ${err.message}`); // Log error
    res.status(500).send('Server Error'); // Ensure response is sent on error
  }
});

module.exports = router;