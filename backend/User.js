// User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'manager'],
    default: 'employee'
  },
  
  // --- ADD THESE TWO LINES ---
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date }
  // ---------------------------
});

module.exports = mongoose.model('User', UserSchema);