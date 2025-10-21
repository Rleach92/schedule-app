// frontend/src/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ResetPasswordPage.css'; // Assuming you create this

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Corrected: Directly call functions needed, not whole context object
  const authContext = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { /*...*/ return; }
    if (password.length < 6) { /*...*/ return; }
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password/${token}`, { // Use API_URL
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed reset');
      alert('Password reset! You are logged in.');
      localStorage.setItem('token', data.token); // Manually set token
      // Use loadUser from context AFTER setting token
      if (authContext.loadUser) {
           await authContext.loadUser(); // Ensure user data is loaded
      }
      navigate('/dashboard');
      // Consider removing reload if loadUser handles state update correctly
      // window.location.reload();

    } catch (err) { alert(err.message); }
  };

  return (
    <div className="reset-password-container"> {/* Add className */}
      <h2 style={{ textAlign: 'center' }}>Reset Password</h2>
      <form onSubmit={onSubmit}>
        <input type="password" placeholder="New Password (min. 6)" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" /> {/* Add className */}
        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-field" /> {/* Add className */}
        <button type="submit" className="submit-button">Set New Password</button> {/* Add className */}
      </form>
    </div>
  );
}
export default ResetPasswordPage;