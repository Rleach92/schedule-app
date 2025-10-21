// frontend/src/components/pto/PtoRequestForm.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toYYYYMMDD } from '../../utils/date-helpers';
import './PtoRequestForm.css';

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

function PtoRequestForm({ onPtoRequest }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({ date: toYYYYMMDD(new Date()), reason: '' });
  const { date, reason } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!token) throw new Error("Authentication token missing.");
      const res = await fetch(`${API_URL}/api/pto`, { // Use API_URL
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify(formData),
      });
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.msg || 'Failed submit'); }
      alert('PTO Request submitted!'); onPtoRequest(); setFormData({ ...formData, reason: '' });
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="pto-form-container">
      <h3>Request Time Off</h3>
      <form onSubmit={handleSubmit} className="pto-form">
        <input type="date" name="date" value={date} onChange={onChange} className="pto-form-input" required />
        <input type="text" name="reason" placeholder="Reason (optional)" value={reason} onChange={onChange} className="pto-form-input" />
        <button type="submit" className="pto-form-submit-btn">Submit Request</button>
      </form>
    </div>
  );
}
export default PtoRequestForm;