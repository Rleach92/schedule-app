// frontend/src/components/schedule/ScheduleDisplay.js
import React, { useState } from 'react';
import { getWeekDayNames } from '../../utils/date-helpers';
import { useAuth } from '../../context/AuthContext';
import './ScheduleDisplay.css'; // 1. Import CSS

// 2. Delete styles object

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
const dayIndexToKey = { 5: 'friday', 6: 'saturday', 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday' };

function ScheduleDisplay({ schedule, events = [], onSwapRequest }) {
  const { user } = useAuth();
  const [selection, setSelection] = useState(null); // Holds selected 'Shift A'

  // Determine start date robustly
  const getStartDate = () => {
    if (schedule && schedule.weekStarting) {
      return new Date(schedule.weekStarting);
    }
    // Find the earliest event date if no schedule
    if (events.length > 0) {
      const earliestEvent = events.reduce((earliest, current) =>
        new Date(current.date) < new Date(earliest.date) ? current : earliest
      );
      // Need to adjust this to the start of *its* week (Friday)
      const eventDate = new Date(earliestEvent.date);
      const dayOfWeek = eventDate.getUTCDay();
      const diff = (dayOfWeek < 5) ? (dayOfWeek + 2) : (dayOfWeek - 5);
      eventDate.setUTCDate(eventDate.getUTCDate() - diff);
      eventDate.setUTCHours(0,0,0,0);
      return eventDate;
    }
    // Default to today if no schedule or events
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = (dayOfWeek < 5) ? (dayOfWeek + 2) : (dayOfWeek - 5);
    today.setDate(today.getDate() - diff);
    today.setHours(0,0,0,0);
    return today;
  };

  const startDate = getStartDate();
  const dayNames = getWeekDayNames(startDate);

  // Group events by day
  const eventsByDay = {};
  dayKeys.forEach(key => eventsByDay[key] = []);
  events.forEach(event => {
    const eventDate = new Date(event.date);
    const dayKey = dayIndexToKey[eventDate.getUTCDay()];
    if (dayKey) { eventsByDay[dayKey].push(event); }
  });

  const handleShiftClick = (shift, shiftDate, dayKey) => {
    // Only allow clicking if schedule and onSwapRequest exist
    if (!schedule || !onSwapRequest) return;

    const fullShiftObject = {
      ...shift,
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

  // 3. Use className strings
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
      if (selection._id === shift._id) {
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
          {dayNames.map((day) => (<th key={day} className="schedule-th">{day}</th>))}
        </tr>
      </thead>
      <tbody>
        {/* Events Row */}
        <tr>
          {dayKeys.map((dayKey) => (
            <td key={`${dayKey}-events`} className="schedule-event-td">
              {eventsByDay[dayKey].map((event) => (
                <div // Use div instead of span for block behavior
                  key={event._id}
                  className="event-tag" // Use className
                  style={{ backgroundColor: getEventColor(event.type) }} // Keep dynamic color inline
                  title={event.title} // Add tooltip
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
              const currentDayDate = new Date(startDate); // Use calculated startDate
              currentDayDate.setUTCDate(currentDayDate.getUTCDate() + i);

              return (
                <td key={dayKey} className="schedule-td">
                  {schedule.days[dayKey] &&
                    schedule.days[dayKey].map((shift) => (
                      <div
                        key={shift._id}
                        className={getShiftClassName(shift)} // Use dynamic className
                        onClick={() => handleShiftClick(shift, currentDayDate, dayKey)}
                        title={onSwapRequest && shift.user === user._id ? "Click to select this shift for a swap" : onSwapRequest && !selection ? "Select your shift first" : onSwapRequest && selection ? `Click to propose swapping your selected shift for ${shift.userName}'s shift` : ""} // Add tooltip based on state
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