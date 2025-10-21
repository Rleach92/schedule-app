// backend/models/PtoRequest.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PtoRequestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: { // Store the name for easy display
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  managedBy: { // The manager who approved/denied it
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

// Add an index for faster queries
PtoRequestSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('PtoRequest', PtoRequestSchema);