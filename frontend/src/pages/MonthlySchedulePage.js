// frontend/src/pages/MonthlySchedulePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './MonthlySchedulePage.css';

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

const monthNames = [/*...*/]; // Keep monthNames
const dayNames = [/*...*/]; // Keep dayNames

function MonthlySchedulePage() {
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthData, setMonthData] = useState({ schedules: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const fetchMonthData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (!token) throw new Error("Authentication token is missing.");
      const res = await fetch(`${API_URL}/api/schedules/month?year=${year}&month=${month}`, { // Use API_URL
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

  useEffect(() => { fetchMonthData(); }, [fetchMonthData]);

  const generateCalendarGrid = () => { /* ... Keep existing grid generation logic ... */ };
  const goToPreviousMonth = () => { /* ... Keep existing logic ... */ };
  const goToNextMonth = () => { /* ... Keep existing logic ... */ };

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
          <thead><tr>{dayNames.map(day => <th key={day}>{day}</th>)}</tr></thead>
          <tbody>{generateCalendarGrid()}</tbody>
        </table>
      )}
    </div>
  );
}
export default MonthlySchedulePage;