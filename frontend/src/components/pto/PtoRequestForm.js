// frontend/src/components/pto/PtoRequestForm.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toYYYYMMDD } from '../../utils/date-helpers';
import './PtoRequestForm.css'; // 1. Import CSS

// 2. Delete styles object

function PtoRequestForm({ onPtoRequest }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    date: toYYYYMMDD(new Date()),
    reason: '',
  });

  const { date, reason } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/pto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || 'Failed to submit request');
      }

      alert('PTO Request submitted successfully!');
      onPtoRequest();
      setFormData({ ...formData, reason: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Use className
  return (
    <div className="pto-form-container">
      <h3>Request Time Off</h3>
      <form onSubmit={handleSubmit} className="pto-form">
        <input
          type="date"
          name="date"
          value={date}
          onChange={onChange}
          className="pto-form-input" // Use className
          required // Make date required
        />
        <input
          type="text"
          name="reason"
          placeholder="Reason (optional)"
          value={reason}
          onChange={onChange}
          className="pto-form-input" // Use className
        />
        <button type="submit" className="pto-form-submit-btn">
          Submit Request
        </button>
      </form>
    </div>
  );
}

export default PtoRequestForm;