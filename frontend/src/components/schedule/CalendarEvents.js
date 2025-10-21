// frontend/src/components/schedule/CalendarEvents.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toYYYYMMDD } from '../../utils/date-helpers';
import './CalendarEvents.css'; // 1. Import CSS

// 2. Delete styles object

function CalendarEvents({ events, weekStart, onEventChange }) {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: toYYYYMMDD(weekStart),
    title: '',
    type: 'MEETING',
  });

  const { date, title, type } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      alert('Please enter a title for the event.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/calendar-events', {
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

      onEventChange();
      setFormData({ ...formData, title: '' }); // Only clear title
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/calendar-events/${id}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token },
        });
        if (!res.ok) {
          throw new Error('Failed to delete event');
        }
        onEventChange();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // 3. Use className
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
            />
            <input
              type="text"
              name="title"
              placeholder="Event Title (e.g., Mandatory Meeting)"
              value={title}
              onChange={onChange}
              className="events-input" // Use className
            />
            <select
              name="type"
              value={type}
              onChange={onChange}
              className="events-select" // Use className
            >
              <option value="MEETING">Meeting</option>
              <option value="MANDATORY">Mandatory</option>
              <option value="PTO_RESTRICTED">PTO Restricted</option>
            </select>
            <button type="submit" className="events-add-btn">
              Add
            </button>
          </form>

          <h4 className="events-list-header">Events This Week</h4>
          <ul className="events-list">
            {events.map((event) => (
              <li key={event._id} className="events-item">
                <span>
                  <strong>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
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
            {events.length === 0 && <li className="events-none">No events found for this week.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CalendarEvents;