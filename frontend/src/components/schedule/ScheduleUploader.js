// frontend/src/components/schedule/ScheduleUploader.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toYYYYMMDD } from '../../utils/date-helpers';
import './ScheduleUploader.css'; // 1. Import CSS

// 2. Delete styles object

const dayKeys = ["friday", "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday"];
const dayNames = ["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

function ScheduleUploader({ weekStart, onScheduleUploaded }) {
  const { token } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [blankShift, setBlankShift] = useState({ user: '', userName: '', startTime: '09:00', endTime: '17:00' });

  const [scheduleDays, setScheduleDays] = useState({
    friday: [], saturday: [], sunday: [],
    monday: [], tuesday: [], wednesday: [], thursday: []
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const res = await fetch('http://localhost:5000/api/schedules/employees', {
          headers: { 'x-auth-token': token }
        });
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
          if(data.length > 0) {
            setBlankShift(prev => ({ ...prev, user: data[0]._id, userName: data[0].name }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch employees", err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [token]);

  useEffect(() => {
    setScheduleDays({
      friday: [], saturday: [], sunday: [],
      monday: [], tuesday: [], wednesday: [], thursday: []
    });
  }, [weekStart]);

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
    const scheduleData = {
      weekStarting: toYYYYMMDD(weekStart),
      days: scheduleDays
    };
    try {
      const res = await fetch('http://localhost:5000/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(scheduleData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Backend Error:", errorData);
        throw new Error(errorData.msg || 'Failed to submit schedule');
      }
      const newSchedule = await res.json();
      alert('Schedule uploaded successfully!');
      onScheduleUploaded(newSchedule);
      setIsOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Use className
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
                  className="uploader-select" // Use className
                  value={shift.user}
                  onChange={(e) => handleDayChange(dayKey, shiftIndex, 'user', e.target.value)}
                >
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
                <input
                  type="time"
                  className="uploader-input" // Use className
                  value={shift.startTime}
                  onChange={(e) => handleDayChange(dayKey, shiftIndex, 'startTime', e.target.value)}
                />
                <span>to</span>
                <input
                  type="time"
                  className="uploader-input" // Use className
                  value={shift.endTime}
                  onChange={(e) => handleDayChange(dayKey, shiftIndex, 'endTime', e.target.value)}
                />
                <button
                  type="button"
                  className="uploader-remove-btn" // Use className
                  onClick={() => removeShift(dayKey, shiftIndex)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="uploader-add-btn" // Use className
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