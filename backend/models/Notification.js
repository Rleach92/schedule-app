// backend/models/Notification.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  // The user this notification is for
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The alert message
  message: {
    type: String,
    required: true
  },
  // The page to go to when clicked (e.g., "/pto" or "/swaps")
  link: {
    type: String,
    required: true
  },
  // Has the user seen this yet?
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

NotificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);