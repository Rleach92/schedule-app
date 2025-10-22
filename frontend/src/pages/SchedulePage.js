// frontend/src/pages/SchedulePage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeekStartingFriday, toYYYYMMDD } from '../utils/date-helpers';
import WeekNavigator from '../components/schedule/WeekNavigator';
import ScheduleDisplay from '../components/schedule/ScheduleDisplay';
import ScheduleUploader from '../components/schedule/ScheduleUploader';
import CalendarEvents from '../components/schedule/CalendarEvents';
import { useNavigate } from 'react-router-dom';

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

const styles = {
  container: {
    width: '90%',
    maxWidth: '1200px',
    margin: '20px auto',
    fontFamily: 'Arial, sans-serif',
  },
};

// ADD onGlobalDataChange PROP
function SchedulePage({ onGlobalDataChange }) {
  const { user, token } = useAuth();
  const [weekStart, setWeekStart] = useState(getWeekStartingFriday());
  const [schedule, setSchedule] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchWeekData = useCallback(async () => {
    setLoading(true);
    setError('');
    setSchedule(null);
    setEvents([]);

    const dateString = toYYYYMMDD(weekStart);

    try {
      if (!token) {
          throw new Error("Authentication token is missing.");
      }

      const [scheduleRes, eventsRes] = await Promise.all([
        fetch(`${API_URL}/api/schedules/week?date=${dateString}`, { headers: { 'x-auth-token': token } }),
        fetch(`${API_URL}/api/calendar-events/week?weekStart=${dateString}`, { headers: { 'x-auth-token': token } })
      ]);

      let scheduleData = null;
      if (scheduleRes.status === 404) {
        setError('No schedule has been uploaded for this week.');
      } else if (!scheduleRes.ok) {
        let errorMsg = `Failed to fetch schedule (Status: ${scheduleRes.status})`;
        try { const errData = await scheduleRes.json(); errorMsg = errData.msg || errorMsg; } catch(e) {/* Ignore */}
        throw new Error(errorMsg);
      } else {
        scheduleData = await scheduleRes.json();
        setSchedule(scheduleData);
        setError('');
      }

      let eventData = [];
      if (!eventsRes.ok) {
        let errorMsg = `Failed to fetch events (Status: ${eventsRes.status})`;
        try { const errData = await eventsRes.json(); errorMsg = errData.msg || errorMsg; } catch(e) {/* Ignore */}
        throw new Error(errorMsg);
      } else {
        eventData = await eventsRes.json();
        setEvents(eventData);
      }

      if (scheduleRes.status === 404) {
          setError('No schedule has been uploaded for this week.');
      }

    } catch (err) {
      setError(err.message);
      setSchedule(null);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [weekStart, token]);

  useEffect(() => {
    if (token) {
        fetchWeekData();
    } else {
        setLoading(false);
        setError("You must be logged in to view the schedule.");
        setSchedule(null);
        setEvents([]);
    }
  }, [fetchWeekData, token]);

  const onDataChange = () => {
    fetchWeekData();
  };

  const handleSwapRequest = async (shiftA, shiftB) => {
    const formatShift = (s) => `${new Date(s.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'})} (${s.startTime}-${s.endTime})`;
    const confirmMsg = `Are you sure you want to request this swap?\n\nYour Shift: ${formatShift(shiftA)}\nFor\n${shiftB.owner.name}'s Shift: ${formatShift(shiftB)}`;
    if (window.confirm(confirmMsg)) {
      try {
        if (!token) throw new Error("Authentication token missing.");
        const payload = {
            shiftA: { scheduleId: shiftA.scheduleId, dayKey: shiftA.dayKey, id: shiftA._id, date: shiftA.date, startTime: shiftA.startTime, endTime: shiftA.endTime },
            shiftB: { scheduleId: shiftB.scheduleId, dayKey: shiftB.dayKey, id: shiftB._id, date: shiftB.date, startTime: shiftB.startTime, endTime: shiftB.endTime },
            targetUser: shiftB.owner
        };
        const res = await fetch(`${API_URL}/api/swaps`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify(payload) });
        if (!res.ok) { const errData = await res.json(); throw new Error(errData.msg || 'Failed to create swap request'); }
        alert('Swap request submitted! You can check its status on the "Shift Swaps" page.');
        navigate('/swaps');
      } catch (err) { alert(err.message); }
    }
  };

  return (
    <div className="schedule-page-container" style={styles.container}>
      <h2>Weekly Schedule</h2>
      <WeekNavigator weekStart={weekStart} onWeekChange={setWeekStart} />

      {/* RENDER FIX: Pass the global refresh function to the Uploader */}
      {user?.role === 'manager' && (
        <>
          <CalendarEvents events={events} weekStart={weekStart} onEventChange={onDataChange} />
          <ScheduleUploader 
            weekStart={weekStart} 
            onScheduleUploaded={onDataChange} 
            onGlobalDataChange={onGlobalDataChange} // <-- PASS DOWN THE PROP
          />
        </>
      )}

      {/* Conditional Rendering Logic (remains the same) */}
      {loading && <p>Loading schedule...</p>}

      {!loading && error && error !== 'No schedule has been uploaded for this week.' && (
         <p style={{ color: 'red' }}>Error: {error}</p>
      )}

      {!loading && schedule && (
        <ScheduleDisplay schedule={schedule} events={events} onSwapRequest={handleSwapRequest} />
      )}

      {!loading && !schedule && events.length > 0 && error === 'No schedule has been uploaded for this week.' && (
         <ScheduleDisplay schedule={null} events={events} />
      )}

       {!loading && !schedule && events.length === 0 && error === 'No schedule has been uploaded for this week.' && (
         <p>No schedule has been uploaded for this week.</p>
       )}

       {!loading && !schedule && events.length === 0 && error && error !== 'No schedule has been uploaded for this week.' && (
          <p style={{ color: 'red' }}>Error: {error}</p>
       )}

    </div>
  );
}

export default SchedulePage;