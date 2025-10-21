// frontend/src/components/schedule/ScheduleUploader.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toYYYYMMDD } from '../../utils/date-helpers';
import './ScheduleUploader.css';

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

const dayKeys = [/*...*/]; const dayNames = [/*...*/]; // Keep these arrays

function ScheduleUploader({ weekStart, onScheduleUploaded }) {
  const { token } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [blankShift, setBlankShift] = useState({ user: '', userName: '', startTime: '09:00', endTime: '17:00' });
  const [scheduleDays, setScheduleDays] = useState({ /*...*/ }); // Keep initial state

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        if (!token) throw new Error("Authentication token missing.");
        const res = await fetch(`${API_URL}/api/schedules/employees`, { headers: { 'x-auth-token': token } }); // Use API_URL
        if (res.ok) {
          const data = await res.json(); setEmployees(data);
          if(data.length > 0) { setBlankShift(prev => ({ ...prev, user: data[0]._id, userName: data[0].name })); }
        } else { throw new Error("Failed fetch employees"); }
      } catch (err) { console.error(err); }
      finally { setLoadingEmployees(false); }
    };
    fetchEmployees();
  }, [token]);

  useEffect(() => { /* Reset scheduleDays on weekStart change */ }, [weekStart]);

  const handleDayChange = (/*...*/) => { /* Keep existing logic */ };
  const addShift = (/*...*/) => { /* Keep existing logic */ };
  const removeShift = (/*...*/) => { /* Keep existing logic */ };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const scheduleData = { weekStarting: toYYYYMMDD(weekStart), days: scheduleDays };
    try {
      if (!token) throw new Error("Authentication token missing.");
      const res = await fetch(`${API_URL}/api/schedules`, { // Use API_URL
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify(scheduleData)
      });
      if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.msg || 'Failed submit'); }
      const newSchedule = await res.json(); alert('Schedule uploaded!');
      onScheduleUploaded(newSchedule); setIsOpen(false);
    } catch (err) { alert(err.message); }
  };

  const renderUploaderContent = () => { /* ... Keep existing render logic using className ... */ };

  return (
    <div className="uploader-container">
      <button onClick={() => setIsOpen(!isOpen)} className="uploader-toggle-btn">{isOpen ? 'Close' : 'Open'} Schedule Uploader</button>
      {isOpen && renderUploaderContent()}
    </div>
  );
}
export default ScheduleUploader;