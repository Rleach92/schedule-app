// backend/models/ShiftSwap.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShiftSwapSchema = new Schema({
  status: {
    type: String,
    enum: ['pending_target', 'pending_manager', 'approved', 'denied_by_target', 'denied_by_manager'],
    default: 'pending_target'
  },
  
  // --- Requesting User (Employee A) ---
  requestingUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestingUserName: {
    type: String,
    required: true
  },

  // --- Target User (Employee B) ---
  targetUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUserName: {
    type: String,
    required: true
  },
  
  // --- Shift A (Offered by Requester) ---
  shiftA_scheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule', required: true },
  shiftA_dayKey: { type: String, required: true },
  shiftA_originalShiftId: { type: String, required: true },
  shiftA_date: { type: Date, required: true },
  shiftA_startTime: { type: String, required: true },
  shiftA_endTime: { type: String, required: true },

  // --- Shift B (Requested from Target) ---
  shiftB_scheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule', required: true },
  shiftB_dayKey: { type: String, required: true },
  shiftB_originalShiftId: { type: String, required: true },
  shiftB_date: { type: Date, required: true },
  shiftB_startTime: { type: String, required: true },
  shiftB_endTime: { type: String, required: true },

  // --- Management ---
  managedBy: { // Manager who approved/denied
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

ShiftSwapSchema.index({ status: 1 });
ShiftSwapSchema.index({ requestingUser: 1 });
ShiftSwapSchema.index({ targetUser: 1 });

module.exports = mongoose.model('ShiftSwap', ShiftSwapSchema);