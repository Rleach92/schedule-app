// frontend/src/components/schedule/ScheduleDisplay.js
import React, { useState } from 'react';
// IMPORT FIX: Import as a constant, NOT a function. 
// Assuming getWeekDayNames and getWeekStartingFriday are now constants/functions 
// as provided in the fixed date-helpers.js file.
import { getWeekDayNames, getWeekStartingFriday } from '../../utils/date-helpers';
import { useAuth } from '../../context/AuthContext';
import './ScheduleDisplay.css'; 

// Helper to get a color based on event type
const getEventColor = (type) => {
  switch (type) {
    case 'MANDATORY': return '#dc3545'; // Red
    case 'MEETING': return '#007bff'; // Blue
    case 'PTO_RESTRICTED': return '#6c757d'; // Gray
    default: return '#6c757d';
  }
};

const dayKeys = ['friday', 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
// Map JS index (0=Sun, 5=Fri) to your key
const dayIndexToKey = { 5: 'friday', 6: 'saturday', 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday' };

function ScheduleDisplay({ schedule, events = [], onSwapRequest }) {
  const { user } = useAuth();
  const [selection, setSelection] = useState(null); // Holds selected 'Shift A'

  // Determine start date robustly
  const getStartDate = () => {
    // 1. If schedule exists, use its defined start date
    if (schedule && schedule.weekStarting) {
      return new Date(schedule.weekStarting);
    }
    
    // 2. If no schedule, use the fixed utility to find the start of the current week (Friday)
    // This is much safer than reimplementing date logic here.
    return getWeekStartingFriday(); 
  };

  const startDate = getStartDate();
  // CRASH FIX: Use getWeekDayNames as an array constant
  // Assuming the component displaying the week days iterates from the startDate
  const dayNames = getWeekDayNames; 
  
  // Create an array of 7 dates starting from the calculated startDate
  const weekDates = dayNames.map((_, i) => {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + i);
      return date;
  });

  // Group events by day
  const eventsByDay = {};
  dayKeys.forEach(key => eventsByDay[key] = []);
  events.forEach(event => {
    const eventDate = new Date(event.date);
    // Use getUTCDay() for consistency with UTC date string logic
    const dayKey = dayIndexToKey[eventDate.getUTCDay()]; 
    if (dayKey) { eventsByDay[dayKey].push(event); }
  });

  const handleShiftClick = (shift, shiftDate, dayKey) => {
    // Only allow clicking if schedule and onSwapRequest exist
    if (!schedule || !onSwapRequest) return;

    const fullShiftObject = {
      ...shift,
      // Date is now the correct Date object from the loop below
      date: shiftDate, 
      dayKey: dayKey,
      scheduleId: schedule._id,
      owner: { _id: shift.user, name: shift.userName }
    };

    if (!selection) {
      if (shift.user === user._id) {
        setSelection(fullShiftObject);
      } else {
        alert("Please select one of your own shifts first to initiate a swap.");
      }
      return;
    }

    if (selection._id === shift._id) {
      setSelection(null);
      return;
    }

    if (shift.user === user._id) {
      setSelection(fullShiftObject); // Select a different one of my shifts
      return;
    }

    if (shift.user !== user._id) {
      onSwapRequest(selection, fullShiftObject);
      setSelection(null);
    }
  };

  // Use className strings
  const getShiftClassName = (shift) => {
    // Base class applied to all
    let classes = ['shift-base'];

    // If swap mode is inactive (no onSwapRequest prop), show default styles only
    if (!onSwapRequest) {
      classes.push('shift-default'); // Or 'shift-my' if needed
      return classes.join(' ');
    }

    // Determine state based on selection
    if (!selection) {
      classes.push(shift.user === user._id ? 'shift-my' : 'shift-default');
    } else {
      if (selection.id === shift._id) { // Use shift._id for comparison
        classes.push('shift-selected');
      } else if (shift.user === user._id) {
        classes.push('shift-disabled');
      } else {
        classes.push('shift-targetable');
      }
    }
    return classes.join(' '); // e.g., "shift-base shift-my"
  };

  return (
    <table className="schedule-table">
      <thead>
        <tr>
          {/* CRASH FIX: Display day names and corresponding date for clarity */}
          {weekDates.map((dateObj, i) => (
             <th key={dayKeys[i]} className="schedule-th">
                {dayNames[dateObj.getUTCDay()]} ({dateObj.getUTCDate()})
             </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* Events Row */}
        <tr>
          {dayKeys.map((dayKey, i) => (
            <td key={`${dayKey}-events`} className="schedule-event-td">
              {eventsByDay[dayKey].map((event) => (
                <div 
                  key={event._id}
                  className="event-tag"
                  style={{ backgroundColor: getEventColor(event.type) }}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
            </td>
          ))}
        </tr>

        {/* Shifts Row */}
        {schedule && (
          <tr>
            {dayKeys.map((dayKey, i) => {
              const currentDayDate = weekDates[i]; // Get the correct date object from the pre-calculated array
              
              return (
                <td key={dayKey} className="schedule-td">
                  {schedule.days[dayKey] &&
                    schedule.days[dayKey].map((shift) => (
                      <div
                        key={shift._id}
                        className={getShiftClassName(shift)} 
                        onClick={() => handleShiftClick(shift, currentDayDate, dayKey)}
                        title={onSwapRequest && shift.user === user._id ? "Click to select this shift for a swap" : onSwapRequest && !selection ? "Select your shift first" : onSwapRequest && selection ? `Click to propose swapping your selected shift for ${shift.userName}'s shift` : ""}
                      >
                        <div className="shift-name">{shift.userName}</div>
                        <div className="shift-time">
                          {shift.startTime} - {shift.endTime}
                        </div>
                      </div>
                    ))}
                </td>
              );
            })}
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default ScheduleDisplay;