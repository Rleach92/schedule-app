// frontend/src/pages/MonthlySchedulePage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './MonthlySchedulePage.css';

const monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


function MonthlySchedulePage({ globalRefreshKey }) {
  const { token } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [monthData, setMonthData] = useState({ schedules: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed for API

  const fetchMonthData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (!token) throw new Error("Authentication token is missing.");
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
  }, [year, month, token]); 

  useEffect(() => { 
    fetchMonthData(); 
  }, [fetchMonthData, globalRefreshKey]);

  // --- Calendar Grid Generation Logic (with mapping fix from previous step) ---
  const generateCalendarGrid = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); 

    const dataByDate = {};
    
    // Day offset map (required for mapping shifts to a date string)
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
            dataByDate[eventDateStr] = { shifts: [], events: [] };
        }
        dataByDate[eventDateStr].events.push(event);
    });
    
    // Grid Generation
    let dayCounter = 1; 
    let grid = []; 

     for (let week = 0; week < 6; week++) { 
        const weekRow = [];
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            if ((week === 0 && dayOfWeek < firstDayOfMonth) || dayCounter > daysInMonth) {
                weekRow.push(<td key={`empty-${week}-${dayOfWeek}`} className="calendar-day empty"></td>);
            } else {
                // FIX: Variable declaration added here to resolve 'not defined' error.
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

  // --- Navigation Functions (Use setCurrentDate) ---
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
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
        <div className="calendar-responsive-wrapper">
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
        </div>
      )}
    </div>
  );
}

export default MonthlySchedulePage;