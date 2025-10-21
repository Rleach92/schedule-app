// backend/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const managerAuth = require('../middleware/managerAuth'); // Import managerAuth
const User = require('../User');
// Import other models needed for cleanup (optional but good practice)
const Schedule = require('../models/Schedule');
const PtoRequest = require('../models/PtoRequest');
const ShiftSwap = require('../models/ShiftSwap');
const Notification = require('../models/Notification');

// --- (Existing PUT /me/details route) ---
router.put('/me/details', auth, async (req, res) => { /* ... */ });

// --- (Existing PUT /me/password route) ---
router.put('/me/password', auth, async (req, res) => { /* ... */ });

// --- !! NEW ROUTE: GET / (Get all users for manager view) !! ---
// @route   GET /api/users
// @desc    Get all users (basic info)
// @access  Manager Only
router.get('/', managerAuth, async (req, res) => {
    try {
        // Find all users, exclude passwords
        const users = await User.find().select('-password').sort({ name: 1 });
        res.json(users);
    } catch (err) {
        console.error(`Error in GET /api/users: ${err.message}`);
        res.status(500).send('Server Error');
    }
});


// --- !! NEW ROUTE: DELETE /:id (Remove User) !! ---
// @route   DELETE /api/users/:id
// @desc    Delete a user account
// @access  Manager Only
router.delete('/:id', managerAuth, async (req, res) => {
    const userIdToDelete = req.params.id;
    const managerId = req.user.id; // ID of the manager performing the action

    try {
        // 1. Prevent manager from deleting themselves
        if (userIdToDelete === managerId) {
            return res.status(400).json({ msg: 'Managers cannot delete their own account.' });
        }

        // 2. Find the user to delete
        const user = await User.findById(userIdToDelete);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // 3. Delete the user document
        await User.findByIdAndDelete(userIdToDelete);

        // --- Optional Cleanup (Recommended) ---
        // Remove user from any shifts in future schedules
        // Invalidate pending PTO/Swap requests involving the user
        // Delete notifications for the user
        // This can get complex, so we'll skip the full implementation for now,
        // but ideally, you'd handle these cases.
        // Example: await PtoRequest.deleteMany({ user: userIdToDelete });
        // Example: await Notification.deleteMany({ user: userIdToDelete });
        // Example: Clean up schedules (more complex query needed)

        console.log(`User ${user.name} (ID: ${userIdToDelete}) deleted by Manager (ID: ${managerId})`);
        res.json({ msg: `User ${user.name} deleted successfully.` });

    } catch (err) {
        console.error(`Error in DELETE /api/users/:id: ${err.message}`);
        res.status(500).send('Server Error');
    }
});


module.exports = router;