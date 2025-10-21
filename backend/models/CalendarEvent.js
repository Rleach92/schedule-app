// backend/models/CalendarEvent.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CalendarEventSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['MEETING', 'MANDATORY', 'PTO_RESTRICTED'],
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Add an index on the date field for faster queries
CalendarEventSchema.index({ date: 1 });

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);