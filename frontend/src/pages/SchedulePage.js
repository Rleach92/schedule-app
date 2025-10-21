// frontend/src/pages/SchedulePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeekStartingFriday, toYYYYMMDD } from '../utils/date-helpers';
import WeekNavigator from '../components/schedule/WeekNavigator';
import ScheduleDisplay from '../components/schedule/ScheduleDisplay';
import ScheduleUploader from '../components/schedule/ScheduleUploader';
import CalendarEvents from '../components/schedule/CalendarEvents';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    width: '90%',
    maxWidth: '1200px',
    margin: '20px auto',
    fontFamily: 'Arial, sans-serif',
  },
};

function SchedulePage() {
  const { user, token } = useAuth();
  const [weekStart, setWeekStart] = useState(getWeekStartingFriday());
  const [schedule, setSchedule] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // useCallback still memoizes the function based on weekStart and token
  const fetchWeekData = useCallback(async () => {
    console.log(`fetchWeekData called for week starting: ${weekStart.toISOString()}`); // LOG 1
    // Don't reset state here if it's already fetching, prevent flicker
    if (!loading) setLoading(true);
    setError('');
    // Only clear schedule/events if we are *sure* we are starting a fresh fetch
    // setSchedule(null);
    // setEvents([]);

    const dateString = toYYYYMMDD(weekStart);

    try {
      console.log('Fetching schedule and events...'); // LOG 2
      // Add a check for token existence before fetching
      if (!token) {
          throw new Error("Authentication token is missing.");
      }

      const [scheduleRes, eventsRes] = await Promise.all([
        fetch(
          `http://localhost:5000/api/schedules/week?date=${dateString}`,
          { headers: { 'x-auth-token': token } }
        ),
        fetch(
          `http://localhost:5000/api/calendar-events/week?weekStart=${dateString}`,
          { headers: { 'x-auth-token': token } }
        ),
      ]);

      console.log(`Schedule Response Status: ${scheduleRes.status}`); // LOG 3
      console.log(`Events Response Status: ${eventsRes.status}`);   // LOG 4

      // --- Process Schedule ---
      let scheduleData = null; // Temp variable
      if (scheduleRes.status === 404) {
        console.log('No schedule found for this week.'); // LOG 5
        // Don't set error globally yet, just note no schedule
      } else if (!scheduleRes.ok) {
        let errorMsg = `Failed to fetch schedule (Status: ${scheduleRes.status})`;
        try { const errData = await scheduleRes.json(); errorMsg = errData.msg || errorMsg; } catch(e) {/* Ignore */}
        throw new Error(errorMsg); // Throw if critical error
      } else {
        scheduleData = await scheduleRes.json(); // Assign to temp variable
        console.log('Schedule data received:', scheduleData); // LOG 6
      }

      // --- Process Events ---
      let eventData = []; // Temp variable
      if (!eventsRes.ok) {
        let errorMsg = `Failed to fetch events (Status: ${eventsRes.status})`;
        try { const errData = await eventsRes.json(); errorMsg = errData.msg || errorMsg; } catch(e) {/* Ignore */}
        throw new Error(errorMsg); // Throw if critical error
      } else {
        eventData = await eventsRes.json(); // Assign to temp variable
        console.log('Events data received:', eventData); // LOG 7
      }

      // --- Update State AFTER both fetches (or 404) ---
      setSchedule(scheduleData); // Will be null if 404
      setEvents(eventData);
      if (scheduleData) {
          setError(''); // Clear error only if schedule is successfully found
      } else {
          setError('No schedule has been uploaded for this week.'); // Set specific error for 404
      }


    } catch (err) {
      console.error('Error in fetchWeekData:', err); // LOG 8
      setError(err.message); // Set error state
      setSchedule(null); // Clear data on error
      setEvents([]);
    } finally {
      console.log('Setting loading to false.'); // LOG 9
      setLoading(false);
    }
  }, [weekStart, token, loading]); // Added loading to dependency array for useCallback

  // --- **** SIMPLIFIED useEffect DEPENDENCIES **** ---
  // This effect now only runs when weekStart or token changes.
  useEffect(() => {
    console.log("useEffect triggered: calling fetchWeekData (due to weekStart/token change)"); // LOG 10
    if (token) {
        fetchWeekData();
    } else {
        setLoading(false);
        setError("You must be logged in to view the schedule.");
        console.log("useEffect: No token found, skipping fetch.");
        setSchedule(null); // Ensure data is cleared if token disappears
        setEvents([]);
    }
  // Remove fetchWeekData from here, rely on weekStart/token
  }, [weekStart, token]);
  // --- **** END CHANGE **** ---


  // Callback function for components to trigger a refetch
  const onDataChange = () => {
    console.log("onDataChange called: triggering fetchWeekData"); // LOG 11
    fetchWeekData();
  };

  const handleSwapRequest = async (shiftA, shiftB) => {
    // ... (swap request logic - unchanged) ...
    const formatShift = (s) => `${new Date(s.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} (${s.startTime}-${s.endTime})`;
    const confirmMsg = `Are you sure you want to request this swap?\n\nYour Shift: ${formatShift(shiftA)}\nFor\n${shiftB.owner.name}'s Shift: ${formatShift(shiftB)}`;
    if (window.confirm(confirmMsg)) {
      try {
        const payload = { shiftA: {...shiftA, id: shiftA._id }, shiftB: {...shiftB, id: shiftB._id }, targetUser: shiftB.owner };
        const res = await fetch('http://localhost:5000/api/swaps', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify(payload) });
        if (!res.ok) { const errData = await res.json(); throw new Error(errData.msg || 'Failed to create swap request'); }
        alert('Swap request submitted!'); navigate('/swaps');
      } catch (err) { alert(err.message); }
    }
  };

  // --- Render Logic ---
  console.log("Rendering SchedulePage. Loading:", loading, "Error:", error, "Schedule:", schedule ? 'Exists' : 'Null', "Events Count:", events.length); // LOG 12

  return (
    <div style={styles.container}>
      <h2>Weekly Schedule</h2>
      <WeekNavigator weekStart={weekStart} onWeekChange={setWeekStart} />

      {user.role === 'manager' && (
        <>
          <CalendarEvents events={events} weekStart={weekStart} onEventChange={onDataChange} />
          <ScheduleUploader weekStart={weekStart} onScheduleUploaded={onDataChange} />
        </>
      )}

      {/* Conditional Rendering based on state */}
      {loading && <p>Loading schedule...</p>}

      {!loading && error && error !== 'No schedule has been uploaded for this week.' && (
         <p style={{ color: 'red' }}>Error: {error}</p>
      )}

      {/* Show schedule if it exists */}
      {!loading && schedule && (
        <ScheduleDisplay schedule={schedule} events={events} onSwapRequest={handleSwapRequest} />
      )}

      {/* Show events-only display if no schedule found but events exist */}
      {!loading && !schedule && events.length > 0 && (
         <ScheduleDisplay schedule={null} events={events} />
      )}

       {/* Show "No schedule" message specifically */}
       {!loading && !schedule && events.length === 0 && error === 'No schedule has been uploaded for this week.' && (
         <p>No schedule has been uploaded for this week.</p>
       )}

        {/* Fallback for no data and no specific 404 error */}
       {!loading && !schedule && events.length === 0 && error && error !== 'No schedule has been uploaded for this week.' && (
         <p style={{ color: 'red' }}>Error: {error}</p> // Show other errors here too
       )}

    </div>
  );
}

export default SchedulePage;