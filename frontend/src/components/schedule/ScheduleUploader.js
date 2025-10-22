// frontend/src/components/schedule/ScheduleUploader.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toYYYYMMDD } from '../../utils/date-helpers';
import './ScheduleUploader.css';

// Define the base URL for the API (Keep this external for safety)
const API_URL = 'https://my-schedule-api-q374.onrender.com';

const dayKeys = ["friday", "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday"];
const dayNames = ["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

// ADD onGlobalDataChange PROP
function ScheduleUploader({ weekStart, onScheduleUploaded, onGlobalDataChange }) {
  const { token } = useAuth();
  
  // Keep needed state variables
  const [employees, setEmployees] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Keep blankShift, used inside addShift
  const [blankShift, setBlankShift] = useState({ user: '', userName: '', startTime: '09:00', endTime: '17:00' });
  
  // Keep scheduleDays and setter
  const [scheduleDays, setScheduleDays] = useState({
    friday: [], saturday: [], sunday: [],
    monday: [], tuesday: [], wednesday: [], thursday: []
  });

  // Fetch Employees
  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      if (!token) throw new Error("Authentication token missing.");
      const res = await fetch(`${API_URL}/api/schedules/employees`, { headers: { 'x-auth-token': token } });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
        if(data.length > 0) {
          setBlankShift(prev => ({ ...prev, user: data[0]._id, userName: data[0].name }));
        }
      } else { throw new Error("Failed to fetch employees"); }
    } catch (err) { console.error("Failed to fetch employees", err); }
    finally { setLoadingEmployees(false); }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]); // Run on mount/token change

  useEffect(() => {
    // Reset scheduleDays on weekStart change
    setScheduleDays({
      friday: [], saturday: [], sunday: [],
      monday: [], tuesday: [], wednesday: [], thursday: []
    });
  }, [weekStart]);

  // Handler functions (kept because they are used in the returned JSX)
  const handleDayChange = (dayKey, shiftIndex, field, value) => {
    const newDays = { ...scheduleDays };
    const newShifts = [...newDays[dayKey]];
    if (field === 'user') {
      const selectedEmployee = employees.find(emp => emp._id === value);
      newShifts[shiftIndex].user = selectedEmployee._id;
      newShifts[shiftIndex].userName = selectedEmployee.name;
    } else {
      newShifts[shiftIndex][field] = value;
    }
    newDays[dayKey] = newShifts;
    setScheduleDays(newDays);
  };

  const addShift = (dayKey) => {
    const newDays = { ...scheduleDays };
    if (blankShift.user) {
      newDays[dayKey] = [...newDays[dayKey], { ...blankShift }];
      setScheduleDays(newDays);
    } else {
      alert("Error: Cannot add a shift. No employees are available.");
    }
  };

  const removeShift = (dayKey, shiftIndex) => {
    const newDays = { ...scheduleDays };
    newDays[dayKey].splice(shiftIndex, 1);
    setScheduleDays(newDays);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const scheduleData = { weekStarting: toYYYYMMDD(weekStart), days: scheduleDays };
    try {
      if (!token) throw new Error("Authentication token missing.");
      const res = await fetch(`${API_URL}/api/schedules`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify(scheduleData)
      });
      if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.msg || 'Failed to submit schedule'); }
      const newSchedule = await res.json();
      alert('Schedule uploaded successfully!');
      onScheduleUploaded(newSchedule);
      
      // FIX: Call global refresh function to update Monthly Schedule Page
      if (onGlobalDataChange) {
        onGlobalDataChange();
      }
      
      setIsOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const renderUploaderContent = () => {
    if (loadingEmployees) {
      return <p>Loading employee list...</p>;
    }

    if (employees.length === 0) {
      return (
        <p className="uploader-error-text">
          <b>Error:</b> No employee accounts found. Please register at least one 'employee' user to create a schedule.
        </p>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="uploader-form">
        {dayKeys.map((dayKey, index) => (
          <div key={dayKey} className="uploader-day-box">
            <h4 className="uploader-day-header">{dayNames[index]}</h4>
            {scheduleDays[dayKey].map((shift, shiftIndex) => (
              <div key={shiftIndex} className="uploader-shift-row">
                <select
                  className="uploader-select"
                  value={shift.user}
                  onChange={(e) => handleDayChange(dayKey, shiftIndex, 'user', e.target.value)}
                >
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
                <input
                  type="time"
                  className="uploader-input"
                  value={shift.startTime}
                  onChange={(e) => handleDayChange(dayKey, shiftIndex, 'startTime', e.target.value)}
                />
                <span>to</span>
                <input
                  type="time"
                  className="uploader-input"
                  value={shift.endTime}
                  onChange={(e) => handleDayChange(dayKey, shiftIndex, 'endTime', e.target.value)}
                />
                <button
                  type="button"
                  className="uploader-remove-btn"
                  onClick={() => removeShift(dayKey, shiftIndex)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="uploader-add-btn"
              onClick={() => addShift(dayKey)}
            >
              + Add Shift
            </button>
          </div>
        ))}
        <button type="submit" className="uploader-submit-btn">
          Publish Schedule
        </button>
      </form>
    );
  };

  return (
    <div className="uploader-container">
      <button onClick={() => setIsOpen(!isOpen)} className="uploader-toggle-btn">
        {isOpen ? 'Close Schedule Uploader' : 'Open Schedule Uploader'}
      </button>
      {isOpen && renderUploaderContent()}
    </div>
  );
}

export default ScheduleUploader;