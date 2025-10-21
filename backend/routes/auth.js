// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../User'); // Adjust path if needed
const auth = require('../middleware/auth'); // Adjust path if needed

// --- Use variables from .env (loaded by server.js) ---
const JWT_SECRET = process.env.JWT_SECRET;
const MANAGER_SECRET_CODE = process.env.MANAGER_SECRET_CODE;
// -----------------------------------------------------

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, managerCode } = req.body;

    // Check manager code if applicable
    if (role === 'manager') {
      if (!MANAGER_SECRET_CODE || managerCode !== MANAGER_SECRET_CODE) { // Check if secret exists
        return res.status(401).json({ msg: 'Invalid Manager Code' });
      }
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();
    res.status(201).json({ msg: 'User created successfully' });

  } catch (err) {
    console.error(`Error in POST /register: ${err.message}`);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Log in a user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create payload
    const payload = {
      user: {
        id: user.id, // or user._id depending on your setup (Mongoose uses id virtual)
        name: user.name,
        role: user.role
      }
    };

    // Sign token using secret from .env
    if (!JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables!");
        return res.status(500).send('Server configuration error.');
    }
    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });

  } catch (err) {
    console.error(`Error in POST /login: ${err.message}`);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth
// @desc    Get the logged-in user's data (uses auth middleware)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // req.user is added by the auth middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
        // This case might happen if the user was deleted after the token was issued
        return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(`Error in GET /api/auth: ${err.message}`);
    res.status(500).send('Server Error');
  }
});


// @route   POST /api/auth/forgot-password
// @desc    User requests a password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Send generic success even if user not found (security)
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.json({ msg: 'If an account with this email exists, a reset link has been sent.' });
    }

    // Create token
    const token = crypto.randomBytes(20).toString('hex');

    // Set token and expiration on user
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL (points to frontend)
    const resetURL = `http://localhost:3000/reset-password/${token}`; // TODO: Change for deployment

    // Send email via Ethereal
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email", port: 587, secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    let info = await transporter.sendMail({
      from: '"Schedule App Admin" <noreply@schedule-app.com>', to: user.email, subject: "Password Reset Request",
      text: `Click here to reset your password: ${resetURL}\n\nIf you did not request this, please ignore this email.`,
      html: `<p>Please click the link below to reset your password:</p><p><a href="${resetURL}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p>`
    });

    console.log("--- PASSWORD RESET EMAIL SENT (TEST) ---");
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    console.log("------------------------------------------");

    res.json({ msg: 'If an account with this email exists, a reset link has been sent.' });

  } catch (err) {
    console.error(`Error in POST /forgot-password: ${err.message}`);
    res.status(500).send('Server Error');
  }
});


// @route   POST /api/auth/reset-password/:token
// @desc    Reset a user's password using token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Validate password length
     if (!newPassword || newPassword.length < 6) {
         return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
     }

    // Find user by token and check expiration
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: Date.now() } // $gt = greater than now
    });

    if (!user) {
      return res.status(400).json({ msg: 'Password reset token is invalid or has expired.' });
    }

    // Hash and set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log the user in by sending back a new JWT token
    const payload = {
      user: { id: user.id, name: user.name, role: user.role }
    };
     if (!JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables!");
        return res.status(500).send('Server configuration error.');
    }
    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token }); // Send token to log them in automatically
    });

  } catch (err) {
    console.error(`Error in POST /reset-password: ${err.message}`);
    res.status(500).send('Server Error');
  }
});

module.exports = router;