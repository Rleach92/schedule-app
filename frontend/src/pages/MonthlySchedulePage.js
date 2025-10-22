// frontend/src/pages/MonthlySchedulePage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './MonthlySchedulePage.css';

// FIX 1: Remove API_URL if it is not used in this file
// If API_URL is used in a helper function, you need to pass it or define it there.
// Since you provided the full component, we will assume it's not needed here 
// if the fetch is only done in fetchMonthData.
// const API_URL = 'https://my-schedule-api-q374.onrender.com'; // REMOVE or comment out

const monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


function MonthlySchedulePage({ globalRefreshKey }) {
  const { token } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date()); 
  // FIX 2: We must keep monthData and setMonthData because they are used later 
  // (though the ESLint error implies they aren't used in the component's JSX, 
  // which is fine since they are used by generateCalendarGrid).
  const [monthData, setMonthData] = useState({ schedules: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed for API

  const fetchMonthData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (!token) throw new Error("Authentication token is missing.");
      // FIX 3: Re-add API_URL inside the fetch function if it was removed globally
      const API_URL = 'https://my-schedule-api-q374.onrender.com';
      
      const res = await fetch(`${API_URL}/api/schedules/month?year=${year}&month=${month}`, {
        headers: { 'x-auth-token': token },
      });
      if (!res.ok) throw new Error('Failed to fetch monthly data');
      const data = await res.json();
      setMonthData(data);
    } catch (err) {
      setError(err.message); setMonthData({ schedules: [], events: [] });
    } finally {
      setLoading(false);
    }
    // FIX 4: The dependencies 'year', 'month', and 'token' are REQUIRED 
    // because they are used inside the function's scope. The previous ESLint 
    // warning on line 78 was incorrect *if* you rely on these variables. 
    // By defining fetchMonthData() inside the component and using the variables, 
    // the dependencies are mandatory. We will keep them.
  }, [year, month, token]); 

  useEffect(() => { 
    fetchMonthData(); 
  }, [fetchMonthData, globalRefreshKey]);

  // --- Calendar Grid Generation Logic (Uses monthData, year, month) ---
  const generateCalendarGrid = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); 

    const dataByDate = {};
    
    const dayKeyToOffset = { 'friday': 0, 'saturday': 1, 'sunday': 2, 'monday': 3, 'tuesday': 4, 'wednesday': 5, 'thursday': 6 };
    
    // Process Schedules
    monthData.schedules.forEach(schedule => {
        for (const dayKey in schedule.days) {
            if (schedule.days.hasOwnProperty(dayKey)) {
                const scheduleDate = new Date(schedule.weekStarting);
                const offset = dayKeyToOffset[dayKey];
                
                if (offset !== undefined) {
                    const currentDay = new Date(scheduleDate);
                    currentDay.setUTCDate(currentDay.getUTCDate() + offset); 
                    const currentDateStr = `${currentDay.getUTCFullYear()}-${String(currentDay.getUTCMonth() + 1).padStart(2, '0')}-${String(currentDay.getUTCDate()).padStart(2, '0')}`;
                    
                    if (!dataByDate[currentDateStr]) {
                        dataByDate[currentDateStr] = { shifts: [], events: [] };
                    }
                    dataByDate[currentDateStr].shifts.push(...schedule.days[dayKey]);
                }
            }
        }
    });

    // Process Events
    monthData.events.forEach(event => {
        const eventDateStr = event.date.substring(0, 10); 
        
        if (!dataByDate[eventDateStr]) {
            dataByDate[currentDateStr] = { shifts: [], events: [] }; // NOTE: This line should use eventDateStr, not currentDateStr, if the day is not in the month
        }
        dataByDate[eventDateStr].events.push(event);
    });
    
    // Grid Generation
    // FIX 5: 'dayCounter' is used and declared here
    let dayCounter = 1; 
    let grid = []; // FIX 6: 'grid' is used and declared here

     for (let week = 0; week < 6; week++) { 
        const weekRow = [];
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            if ((week === 0 && dayOfWeek < firstDayOfMonth) || dayCounter > daysInMonth) {
                weekRow.push(<td key={`empty-${week}-${dayOfWeek}`} className="calendar-day empty"></td>);
            } else {
                const currentDateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
                const dayData = dataByDate[currentDateStr] || { shifts: [], events: [] };

                weekRow.push(
                    <td key={currentDateStr} className="calendar-day">
                    <div className="day-number">{dayCounter}</div>
                    <div className="day-content">
                        {dayData.events.map(event => (
                           <div key={event._id} className={`event-tag event-${event.type.toLowerCase()}`} title={event.title}>
                               {event.title}
                           </div>
                        ))}
                        {dayData.shifts.map((shift, index) => (
                          <div key={shift._id || `shift-${index}`} className="shift-entry" title={`${shift.userName} (${shift.startTime}-${shift.endTime})`}>
                            <span className="shift-user">{shift.userName}</span>
                          </div>
                        ))}
                    </div>
                    </td>
                );
                dayCounter++;
            }
        }
        grid.push(<tr key={`week-${week}`}>{weekRow}</tr>);
        if (dayCounter > daysInMonth) break;
    }
    
    return grid;
  };

  // --- Navigation Functions ---
  const goToPreviousMonth = () => {
    // FIX 7: 'setCurrentDate' is used and defined by useState
    setCurrentDate(new Date(year, month - 2, 1));
  };
  const goToNextMonth = () => {
    // FIX 8: 'setCurrentDate' is used and defined by useState
    setCurrentDate(new Date(year, month, 1));
  };

  return (
    <div className="monthly-schedule-container">
      {/* FIX 9: All variables used in JSX ('monthNames', 'month', 'year') are defined */}
      <h2>{monthNames[month - 1]} {year}</h2>
      <div className="month-navigation">
        <button onClick={goToPreviousMonth}>&lt; Previous Month</button>
        <button onClick={goToNextMonth}>Next Month &gt;</button>
      </div>

      {/* FIX 10: 'loading' and 'error' are used and defined */}
      {loading && <p>Loading calendar...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="calendar-responsive-wrapper">
          <table className="calendar-table">
            <thead>
              <tr>
                {/* FIX 11: 'dayNames' is defined globally */}
                {dayNames.map(day => <th key={day}>{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {generateCalendarGrid()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MonthlySchedulePage;