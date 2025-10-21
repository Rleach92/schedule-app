// frontend/src/components/schedule/CalendarEvents.js
import React, { useState, useEffect } from 'react'; // Added useEffect
import { useAuth } from '../../context/AuthContext';
import { toYYYYMMDD } from '../../utils/date-helpers';
import './CalendarEvents.css'; // Assuming CSS file exists

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

function CalendarEvents({ events, weekStart, onEventChange }) {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    // Initialize date based on weekStart, title, and type
    date: toYYYYMMDD(weekStart || new Date()), // Use weekStart or default to today
    title: '',
    type: 'MEETING',
  });

  // Update form date when weekStart prop changes
  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      date: toYYYYMMDD(weekStart || new Date())
    }));
  }, [weekStart]);


  // Destructure after useState
  const { date, title, type } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { // Check trimmed title
      alert('Please enter a title for the event.');
      return;
    }
    try {
      if (!token) throw new Error("Authentication token is missing.");
      const res = await fetch(`${API_URL}/api/calendar-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || 'Failed to create event');
      }

      onEventChange(); // Trigger a refetch in SchedulePage
      // Reset only title, keep date and type for potentially adding another event on the same day/type
      setFormData(prevData => ({ ...prevData, title: '' }));

    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        if (!token) throw new Error("Authentication token is missing.");
        const res = await fetch(`${API_URL}/api/calendar-events/${id}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token },
        });
        if (!res.ok) {
          // Try to get error message from backend
          let errorMsg = 'Failed to delete event';
          try {
              const errData = await res.json();
              errorMsg = errData.msg || errorMsg;
          } catch(e) { /* Ignore if response not JSON */ }
          throw new Error(errorMsg);
        }
        onEventChange(); // Triggers a refetch
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="events-container">
      <button onClick={() => setIsOpen(!isOpen)} className="events-toggle-btn">
        {isOpen ? 'Close Event Manager' : 'Open Event Manager'}
      </button>

      {isOpen && (
        <div>
          <form onSubmit={handleSubmit} className="events-form">
            <input
              type="date"
              name="date"
              value={date}
              onChange={onChange}
              className="events-input" // Use className
              required // Add required attribute
            />
            <input
              type="text"
              name="title"
              placeholder="Event Title" // Simplified placeholder
              value={title}
              onChange={onChange}
              className="events-input" // Use className
              required // Add required attribute
            />
            <select
              name="type"
              value={type}
              onChange={onChange}
              className="events-select" // Use className
              required // Add required attribute
            >
              <option value="MEETING">Meeting</option>
              <option value="MANDATORY">Mandatory</option>
              <option value="PTO_RESTRICTED">PTO Restricted</option>
            </select>
            <button type="submit" className="events-add-btn">
              Add Event {/* More specific text */}
            </button>
          </form>

          <h4 className="events-list-header">Events This Week</h4>
          {/* Check if events is an array before mapping */}
          {Array.isArray(events) && events.length > 0 ? (
            <ul className="events-list">
              {events.map((event) => (
                <li key={event._id} className="events-item">
                  <span>
                    <strong>
                      {/* Ensure date formatting handles potential invalid dates gracefully */}
                      {event.date ? new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'UTC', // Important for consistency
                      }) : 'Invalid Date'}
                      :
                    </strong>
                    {' '}{event.title} ({event.type})
                  </span>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="events-remove-btn" // Use className
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
             <p className="events-none">No events found for this week.</p> // Use <p> instead of <li>
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarEvents;