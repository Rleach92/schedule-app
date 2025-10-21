// frontend/src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPasswordPage.css'; // Assuming you create this

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, { // Use API_URL
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      });
      const data = await res.json(); setMessage(data.msg);
    } catch (err) { alert('An error occurred.'); }
  };

  return (
    <div className="forgot-password-container"> {/* Add className */}
      <h2 style={{ textAlign: 'center' }}>Forgot Password</h2>
      {message ? ( <p className="message success">{message}</p> /* Add className */) : (
        <form onSubmit={onSubmit}>
          <p>Enter your email address...</p>
          <input type="email" placeholder="Email Address" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" /> {/* Add className */}
          <button type="submit" className="submit-button">Submit</button> {/* Add className */}
        </form>
      )}
      <p className="link-text"> {/* Add className */}
        Remembered? <Link to="/">Login here</Link>
      </p>
    </div>
  );
}
export default ForgotPasswordPage;