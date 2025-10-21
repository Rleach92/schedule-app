// backend/routes/calendarEvents.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const managerAuth = require('../middleware/managerAuth');
const CalendarEvent = require('../models/CalendarEvent');

// @route   POST /api/calendar-events
// @desc    Create a new calendar event
// @access  Manager Only
router.post('/', managerAuth, async (req, res) => {
  const { date, title, type } = req.body;

  try {
    let event = await CalendarEvent.findOne({ date, type });
    if (event) {
      return res.status(400).json({ msg: `An event of type '${type}' already exists on this date.` });
    }

    event = new CalendarEvent({
      date,
      title,
      type,
      createdBy: req.user.id
    });

    await event.save();
    res.json(event);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/calendar-events/week
// @desc    Get all events for a specific week
// @access  Private (All users)
router.get('/week', auth, async (req, res) => {
  const { weekStart } = req.query; 

  if (!weekStart) {
    return res.status(400).json({ msg: 'Week start date is required.' });
  }

  try {
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59); 

    const events = await CalendarEvent.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    res.json(events);
  } catch (err) {
    console.error(err.message);
    // --- THIS WAS THE TYPO ---
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/calendar-events/:id
// @desc    Delete an event
// @access  Manager Only
router.delete('/:id', managerAuth, async (req, res) => {
  try {
    let event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    await CalendarEvent.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Event removed' });
  } catch (err) { 
    console.error(err.message);
    res.status(500).send('Server Error');
  } 
});

module.exports = router;