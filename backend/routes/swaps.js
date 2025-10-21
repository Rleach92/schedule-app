// backend/routes/swaps.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const managerAuth = require('../middleware/managerAuth');

const ShiftSwap = require('../models/ShiftSwap');
const Schedule = require('../models/Schedule');
const Notification = require('../models/Notification'); // 1. Import Notification
const User = require('../User'); // 1. Import User

// --- New Helper Function to notify managers (same as in pto.js) ---
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

// @route   POST /api/swaps
// @desc    Create a new shift swap request
// @access  Private
router.post('/', auth, async (req, res) => {
  const { shiftA, shiftB, targetUser } = req.body;
  
  try {
    if (req.user.id === targetUser._id) {
      return res.status(400).json({ msg: 'You cannot swap shifts with yourself.' });
    }

    const newSwap = new ShiftSwap({
      requestingUser: req.user.id,
      requestingUserName: req.user.name,
      targetUser: targetUser._id,
      targetUserName: targetUser.name,
      // ... (all shift data)
      shiftA_scheduleId: shiftA.scheduleId,
      shiftA_dayKey: shiftA.dayKey,
      shiftA_originalShiftId: shiftA.id,
      shiftA_date: shiftA.date,
      shiftA_startTime: shiftA.startTime,
      shiftA_endTime: shiftA.endTime,
      shiftB_scheduleId: shiftB.scheduleId,
      shiftB_dayKey: shiftB.dayKey,
      shiftB_originalShiftId: shiftB.id,
      shiftB_date: shiftB.date,
      shiftB_startTime: shiftB.startTime,
      shiftB_endTime: shiftB.endTime,
    });
    
    await newSwap.save();
    res.status(201).json(newSwap);

    // 2. --- TRIGGER NOTIFICATION (for Target User) ---
    try {
      const newNotif = new Notification({
        user: newSwap.targetUser,
        message: `${newSwap.requestingUserName} has requested to swap a shift with you.`,
        link: '/swaps'
      });
      await newNotif.save();
    } catch (err) {
      console.error('Error creating swap request notification:', err);
    }
    // ---------------------------------------------

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/swaps/my-requests
// (No change to this route)
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await ShiftSwap.find({
      $or: [
        { requestingUser: req.user.id },
        { targetUser: req.user.id }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/swaps/respond/target/:id
// @desc    Respond to a swap request (by the target employee)
// @access  Private
router.put('/respond/target/:id', auth, async (req, res) => {
  const { response } = req.body; // 'accept' or 'deny'

  try {
    let swap = await ShiftSwap.findById(req.params.id);
    if (!swap) { return res.status(404).json({ msg: 'Swap request not found.' }); }
    if (swap.targetUser.toString() !== req.user.id) { return res.status(401).json({ msg: 'Not authorized.' }); }
    if (swap.status !== 'pending_target') { return res.status(400).json({ msg: 'Request no longer pending.' }); }

    if (response === 'accept') {
      swap.status = 'pending_manager';
      
      // 3. --- TRIGGER NOTIFICATION (for Managers) ---
      notifyAllManagers(
        `${swap.requestingUserName} and ${swap.targetUserName}'s swap is ready for approval.`,
        '/swaps'
      );
      // -----------------------------------------
      
    } else {
      swap.status = 'denied_by_target';
      
      // 4. --- TRIGGER NOTIFICATION (for Requesting User) ---
      try {
        const newNotif = new Notification({
          user: swap.requestingUser,
          message: `${swap.targetUserName} denied your shift swap request.`,
          link: '/swaps'
        });
        await newNotif.save();
      } catch (err) {
        console.error('Error creating swap denied notification:', err);
      }
      // -----------------------------------------------
    }
    
    await swap.save();
    res.json(swap);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/swaps/pending-approval
// (No change to this route)
router.get('/pending-approval', managerAuth, async (req, res) => {
  try {
    const requests = await ShiftSwap.find({ status: 'pending_manager' }).sort({ createdAt: 1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/swaps/respond/manager/:id
// @desc    Approve or deny a swap request (by a manager)
// @access  Manager Only
router.put('/respond/manager/:id', managerAuth, async (req, res) => {
  const { response } = req.body; // 'approve' or 'deny'

  try {
    let swap = await ShiftSwap.findById(req.params.id);
    if (!swap || swap.status !== 'pending_manager') {
      return res.status(404).json({ msg: 'Request not found or not pending manager approval.' });
    }

    if (response === 'approve') {
      swap.status = 'approved';
      // ... (rest of the approval logic from before)
      const schedule = await Schedule.findById(swap.shiftA_scheduleId);
      if (!schedule) throw new Error('Schedule not found');
      const shiftA_index = schedule.days[swap.shiftA_dayKey].findIndex(s => s._id.toString() === swap.shiftA_originalShiftId);
      const shiftB_index = schedule.days[swap.shiftB_dayKey].findIndex(s => s._id.toString() === swap.shiftB_originalShiftId);
      if (shiftA_index === -1 || shiftB_index === -1) { throw new Error('One or both shifts could not be found.'); }
      schedule.days[swap.shiftA_dayKey][shiftA_index].user = swap.targetUser;
      schedule.days[swap.shiftA_dayKey][shiftA_index].userName = swap.targetUserName;
      schedule.days[swap.shiftB_dayKey][shiftB_index].user = swap.requestingUser;
      schedule.days[swap.shiftB_dayKey][shiftB_index].userName = swap.requestingUserName;
      schedule.markModified(`days.${swap.shiftA_dayKey}`);
      schedule.markModified(`days.${swap.shiftB_dayKey}`);
      await schedule.save();
      
    } else {
      swap.status = 'denied_by_manager';
    }
    
    swap.managedBy = req.user.id;
    await swap.save();
    res.json(swap);

    // 5. --- TRIGGER NOTIFICATIONS (for both employees) ---
    try {
      const msg = `Your shift swap with ${response === 'approve' ? swap.targetUserName : swap.requestingUserName} was ${swap.status}.`;
      
      const notifA = new Notification({
        user: swap.requestingUser,
        message: `Your shift swap with ${swap.targetUserName} was ${swap.status}.`,
        link: '/swaps'
      });
      const notifB = new Notification({
        user: swap.targetUser,
        message: `Your shift swap with ${swap.requestingUserName} was ${swap.status}.`,
        link: '/swaps'
      });

      await Notification.insertMany([notifA, notifB]);
    } catch (err) {
      console.error('Error creating manager response notification:', err);
    }
    // -----------------------------------------------------

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;