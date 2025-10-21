// frontend/src/pages/MonthlySchedulePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './MonthlySchedulePage.css'; // We'll create this CSS file next

const monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function MonthlySchedulePage() {
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date()); // Tracks the displayed month/year
  const [monthData, setMonthData] = useState({ schedules: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed for API

  // Fetch data when month/year changes
  const fetchMonthData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/schedules/month?year=${year}&month=${month}`, {
        headers: { 'x-auth-token': token },
      });
      if (!res.ok) throw new Error('Failed to fetch monthly data');
      const data = await res.json();
      setMonthData(data);
    } catch (err) {
      setError(err.message);
      setMonthData({ schedules: [], events: [] }); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [year, month, token]);

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  // --- Calendar Grid Generation Logic ---
  const generateCalendarGrid = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0=Sun, 1=Mon...

    const grid = [];
    let dayCounter = 1;

    // Process schedules and events into a lookup map by date string (YYYY-MM-DD)
    const dataByDate = {};
    monthData.schedules.forEach(schedule => {
        const weekStart = new Date(schedule.weekStarting);
        Object.entries(schedule.days).forEach(([dayKey, shifts]) => {
            if (shifts && shifts.length > 0) {
                // Calculate the actual date for this day's shifts
                let dayOffset;
                switch(dayKey) {
                    case 'friday': dayOffset = 0; break;
                    case 'saturday': dayOffset = 1; break;
                    case 'sunday': dayOffset = 2; break;
                    case 'monday': dayOffset = 3; break;
                    case 'tuesday': dayOffset = 4; break;
                    case 'wednesday': dayOffset = 5; break;
                    case 'thursday': dayOffset = 6; break;
                    default: dayOffset = -1;
                }
                if (dayOffset !== -1) {
                    const shiftDate = new Date(weekStart);
                    shiftDate.setUTCDate(shiftDate.getUTCDate() + dayOffset);
                    // Only include if it's in the *current* displayed month
                    if (shiftDate.getUTCFullYear() === year && shiftDate.getUTCMonth() === month - 1) {
                        const dateStr = shiftDate.toISOString().split('T')[0];
                        if (!dataByDate[dateStr]) dataByDate[dateStr] = { shifts: [], events: [] };
                        dataByDate[dateStr].shifts.push(...shifts);
                    }
                }
            }
        });
    });
     monthData.events.forEach(event => {
         const eventDate = new Date(event.date);
         const dateStr = eventDate.toISOString().split('T')[0];
         if (!dataByDate[dateStr]) dataByDate[dateStr] = { shifts: [], events: [] };
         dataByDate[dateStr].events.push(event);
     });


    // Create weeks (rows)
    for (let week = 0; week < 6; week++) { // Max 6 weeks needed
      const weekRow = [];
      // Create days (cells)
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        // Handle empty cells before the 1st day or after the last day
        if ((week === 0 && dayOfWeek < firstDayOfMonth) || dayCounter > daysInMonth) {
          weekRow.push(<td key={`empty-${week}-${dayOfWeek}`} className="calendar-day empty"></td>);
        } else {
          const currentDateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
          const dayData = dataByDate[currentDateStr] || { shifts: [], events: [] };

          weekRow.push(
            <td key={currentDateStr} className="calendar-day">
              <div className="day-number">{dayCounter}</div>
              <div className="day-content">
                {/* Display Events */}
                {dayData.events.map(event => (
                   <div key={event._id} className={`event-tag event-${event.type.toLowerCase()}`} title={event.title}>
                       {event.title}
                   </div>
                ))}
                {/* Display Shifts */}
                {dayData.shifts.map((shift, index) => (
                  <div key={shift._id || `shift-${index}`} className="shift-entry" title={`${shift.userName} (${shift.startTime}-${shift.endTime})`}>
                    <span className="shift-user">{shift.userName}</span>
                    {/* Optionally show times: <span className="shift-times">{shift.startTime}-{shift.endTime}</span> */}
                  </div>
                ))}
              </div>
            </td>
          );
          dayCounter++;
        }
      }
      grid.push(<tr key={`week-${week}`}>{weekRow}</tr>);
      if (dayCounter > daysInMonth) break; // Stop if we've added all days
    }
    return grid;
  };
  // --- End Calendar Grid Logic ---


  // --- Navigation Functions ---
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1)); // Month is 0-indexed here
  };
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1)); // Month is 0-indexed here
  };
  // --------------------------

  return (
    <div className="monthly-schedule-container">
      <h2>{monthNames[month - 1]} {year}</h2>

      <div className="month-navigation">
        <button onClick={goToPreviousMonth}>&lt; Previous Month</button>
        <button onClick={goToNextMonth}>Next Month &gt;</button>
      </div>

      {loading && <p>Loading calendar...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table className="calendar-table">
          <thead>
            <tr>
              {dayNames.map(day => <th key={day}>{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {generateCalendarGrid()}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MonthlySchedulePage;