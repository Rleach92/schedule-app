// backend/models/Schedule.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This is a sub-document. It won't have its own collection.
const ShiftSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: { // Store the name for easy display on the frontend
    type: String,
    required: true
  },
  startTime: {
    type: String, // We'll store as a string like "09:00"
    required: true
  },
  endTime: {
    type: String, // e.g., "17:00"
    required: true
  }
});

const ScheduleSchema = new Schema({
  // The date of the Friday this schedule week starts on
  weekStarting: {
    type: Date,
    required: true,
    unique: true // Only one schedule doc per week
  },
  // We'll store shifts organized by day for easy lookup
  days: {
    friday: [ShiftSchema],
    saturday: [ShiftSchema],
    sunday: [ShiftSchema],
    monday: [ShiftSchema],
    tuesday: [ShiftSchema],
    wednesday: [ShiftSchema],
    thursday: [ShiftSchema]
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true }); // Adds createdAt and updatedAt

module.exports = mongoose.model('Schedule', ScheduleSchema);