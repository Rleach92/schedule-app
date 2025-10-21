// frontend/src/pages/SchedulePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeekStartingFriday, toYYYYMMDD } from '../utils/date-helpers';
import WeekNavigator from '../components/schedule/WeekNavigator';
import ScheduleDisplay from '../components/schedule/ScheduleDisplay';
import ScheduleUploader from '../components/schedule/ScheduleUploader';
import CalendarEvents from '../components/schedule/CalendarEvents';
import { useNavigate } from 'react-router-dom'; // Ensure useNavigate is imported

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

// Styles object (if you are using CSS files, this might be empty or removed, otherwise keep your styles)
const styles = {
  container: {
    width: '90%',
    maxWidth: '1200px',
    margin: '20px auto',
    fontFamily: 'Arial, sans-serif',
  },
  // Add other inline styles if you didn't convert everything to CSS
};

function SchedulePage() {
  const { user, token } = useAuth(); // Ensure user and token are correctly destructured
  const [weekStart, setWeekStart] = useState(getWeekStartingFriday());
  const [schedule, setSchedule] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Ensure navigate is initialized

  // Use useCallback to memoize fetchWeekData based on weekStart and token
  const fetchWeekData = useCallback(async () => {
    // console.log(`fetchWeekData called for week starting: ${weekStart.toISOString()}`);
    setLoading(true); // Always set loading true at the start of fetch
    setError('');
    // Reset state before fetching
    setSchedule(null);
    setEvents([]);

    const dateString = toYYYYMMDD(weekStart);

    try {
      // console.log('Fetching schedule and events...');
      if (!token) {
          throw new Error("Authentication token is missing.");
      }

      const [scheduleRes, eventsRes] = await Promise.all([
        fetch(`${API_URL}/api/schedules/week?date=${dateString}`, { headers: { 'x-auth-token': token } }),
        fetch(`${API_URL}/api/calendar-events/week?weekStart=${dateString}`, { headers: { 'x-auth-token': token } })
      ]);

      // console.log(`Schedule Response Status: ${scheduleRes.status}`);
      // console.log(`Events Response Status: ${eventsRes.status}`);

      // --- Process Schedule ---
      let scheduleData = null;
      if (scheduleRes.status === 404) {
        // console.log('No schedule found for this week.');
        setError('No schedule has been uploaded for this week.'); // Set specific error
      } else if (!scheduleRes.ok) {
        let errorMsg = `Failed to fetch schedule (Status: ${scheduleRes.status})`;
        try { const errData = await scheduleRes.json(); errorMsg = errData.msg || errorMsg; } catch(e) {/* Ignore */}
        throw new Error(errorMsg);
      } else {
        scheduleData = await scheduleRes.json();
        // console.log('Schedule data received:', scheduleData);
        setSchedule(scheduleData); // Set schedule state
        // Clear error if schedule is found successfully
        setError('');
      }

      // --- Process Events ---
      let eventData = [];
      if (!eventsRes.ok) {
        let errorMsg = `Failed to fetch events (Status: ${eventsRes.status})`;
        try { const errData = await eventsRes.json(); errorMsg = errData.msg || errorMsg; } catch(e) {/* Ignore */}
        throw new Error(errorMsg);
      } else {
        eventData = await eventsRes.json();
        // console.log('Events data received:', eventData);
        setEvents(eventData); // Set events state
      }

      // If no schedule was found (404), ensure the error state reflects that specifically
      if (scheduleRes.status === 404) {
          setError('No schedule has been uploaded for this week.');
      }


    } catch (err) {
      // console.error('Error in fetchWeekData:', err);
      setError(err.message); // Set error state on any failure
      setSchedule(null); // Ensure data is cleared on error
      setEvents([]);
    } finally {
      // console.log('Setting loading to false.');
      setLoading(false); // Always set loading false at the end
    }
  // Simplified dependencies for useCallback
  }, [weekStart, token]);

  // useEffect now depends only on fetchWeekData (which depends on weekStart, token)
  useEffect(() => {
    // console.log("useEffect triggered: calling fetchWeekData");
    if (token) {
        fetchWeekData(); // Call the memoized function
    } else {
        setLoading(false);
        setError("You must be logged in to view the schedule.");
        // console.log("useEffect: No token found, skipping fetch.");
        setSchedule(null);
        setEvents([]);
    }
  // This setup ensures fetchWeekData is stable unless weekStart/token change
  }, [fetchWeekData, token]); // Add token here to refetch if token changes (e.g., login/logout)


  // Callback function for components to trigger a refetch
  const onDataChange = () => {
    // console.log("onDataChange called: triggering fetchWeekData");
    fetchWeekData();
  };

  // Function to handle swap requests
  const handleSwapRequest = async (shiftA, shiftB) => {
    const formatShift = (s) => `${new Date(s.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'})} (${s.startTime}-${s.endTime})`; // Added timeZone
    const confirmMsg = `Are you sure you want to request this swap?\n\nYour Shift: ${formatShift(shiftA)}\nFor\n${shiftB.owner.name}'s Shift: ${formatShift(shiftB)}`;
    if (window.confirm(confirmMsg)) {
      try {
        if (!token) throw new Error("Authentication token missing."); // Add token check
        const payload = {
            // Ensure properties match backend expectations
            shiftA: { scheduleId: shiftA.scheduleId, dayKey: shiftA.dayKey, id: shiftA._id, date: shiftA.date, startTime: shiftA.startTime, endTime: shiftA.endTime },
            shiftB: { scheduleId: shiftB.scheduleId, dayKey: shiftB.dayKey, id: shiftB._id, date: shiftB.date, startTime: shiftB.startTime, endTime: shiftB.endTime },
            targetUser: shiftB.owner // Assuming owner contains _id and name
        };
        const res = await fetch(`${API_URL}/api/swaps`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify(payload) });
        if (!res.ok) { const errData = await res.json(); throw new Error(errData.msg || 'Failed to create swap request'); }
        alert('Swap request submitted! You can check its status on the "Shift Swaps" page.');
        navigate('/swaps'); // Redirect after successful submission
      } catch (err) { alert(err.message); }
    }
  };

  // --- Render Logic ---
  // console.log("Rendering SchedulePage. Loading:", loading, "Error:", error, "Schedule:", schedule ? 'Exists' : 'Null', "Events Count:", events.length);

  return (
    // Use className if using CSS file, otherwise use style={styles.container}
    <div className="schedule-page-container" style={styles.container}>
      <h2>Weekly Schedule</h2>
      <WeekNavigator weekStart={weekStart} onWeekChange={setWeekStart} />

      {/* Render manager components only if user is manager */}
      {user?.role === 'manager' && ( // Added optional chaining for safety
        <>
          <CalendarEvents events={events} weekStart={weekStart} onEventChange={onDataChange} />
          <ScheduleUploader weekStart={weekStart} onScheduleUploaded={onDataChange} />
        </>
      )}

      {/* Conditional Rendering Logic */}
      {loading && <p>Loading schedule...</p>}

      {!loading && error && error !== 'No schedule has been uploaded for this week.' && (
         <p style={{ color: 'red' }}>Error: {error}</p> // Show critical errors
      )}

      {/* Show schedule display if schedule exists (and not loading/critical error) */}
      {!loading && schedule && (
        <ScheduleDisplay schedule={schedule} events={events} onSwapRequest={handleSwapRequest} />
      )}

      {/* Show events-only display if no schedule found but events exist (and not loading/critical error) */}
      {!loading && !schedule && events.length > 0 && error === 'No schedule has been uploaded for this week.' && (
         <ScheduleDisplay schedule={null} events={events} />
      )}

       {/* Show "No schedule" message only if no schedule, no events, and the specific 404 error occurred */}
       {!loading && !schedule && events.length === 0 && error === 'No schedule has been uploaded for this week.' && (
         <p>No schedule has been uploaded for this week.</p>
       )}

       {/* Fallback for other errors when there's no data */}
       {!loading && !schedule && events.length === 0 && error && error !== 'No schedule has been uploaded for this week.' && (
          <p style={{ color: 'red' }}>Error: {error}</p>
       )}

    </div>
  );
}

export default SchedulePage;