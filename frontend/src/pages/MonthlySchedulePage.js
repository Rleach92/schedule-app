// frontend/src/pages/MonthlySchedulePage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './MonthlySchedulePage.css';

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

// FIX: Define these variables OUTSIDE the component if they are constants
// They were likely moved out of the component previously, causing the compiler error.
const monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


// FIX: This function signature defines the variables 'globalRefreshKey'
function MonthlySchedulePage({ globalRefreshKey }) {
  // FIX: These state variables define 'setCurrentDate', 'loading', and 'error'
  const { token } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [monthData, setMonthData] = useState({ schedules: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FIX: These computed variables define 'year' and 'month'
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed for API

  const fetchMonthData = useCallback(async () => {
    setLoading(true); setError('');
    // ... (fetch logic remains the same) ...
  }, [year, month, token]);

  // FIX: globalRefreshKey is defined in the function signature
  useEffect(() => { 
    fetchMonthData(); 
  }, [fetchMonthData, globalRefreshKey]);

  // --- Calendar Grid Generation Logic (This internal function needs access to the component's variables) ---
  const generateCalendarGrid = () => {
    // ... (This function uses 'year', 'month', 'monthData', etc., which are correctly in scope) ...
    
    // FIX: 'grid' is the variable that receives the final JSX output array
    let dayCounter = 1;
    let grid = []; // FIX: 'grid' is declared here

    // ... (loop and mapping logic remains the same) ...
    
    return grid; // FIX: 'grid' is returned here
  };

  // --- Navigation Functions (These functions use 'setCurrentDate', 'year', 'month') ---
  const goToPreviousMonth = () => {
    // FIX: 'setCurrentDate', 'year', and 'month' are defined in the component
    setCurrentDate(new Date(year, month - 2, 1));
  };
  const goToNextMonth = () => {
    // FIX: 'setCurrentDate', 'year', and 'month' are defined in the component
    setCurrentDate(new Date(year, month, 1));
  };

  return (
    <div className="monthly-schedule-container">
      {/* FIX: 'monthNames', 'month', and 'year' are now defined */}
      <h2>{monthNames[month - 1]} {year}</h2> 
      
      <div className="month-navigation">
        {/* FIX: goToPreviousMonth and goToNextMonth are now defined */}
        <button onClick={goToPreviousMonth}>&lt; Previous Month</button>
        <button onClick={goToNextMonth}>Next Month &gt;</button>
      </div>

      {/* FIX: 'loading' and 'error' are now defined */}
      {loading && <p>Loading calendar...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="calendar-responsive-wrapper">
          <table className="calendar-table">
            <thead>
              <tr>
                {/* FIX: 'dayNames' is now defined */}
                {dayNames.map(day => <th key={day}>{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {/* FIX: generateCalendarGrid is now defined */}
              {generateCalendarGrid()} 
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MonthlySchedulePage;