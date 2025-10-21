// frontend/src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const styles = {
  container: { width: '300px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '10px', margin: '10px 0', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' },
  button: { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
  linkText: { textAlign: 'center', marginTop: '15px', fontSize: '14px' },
  message: { padding: '10px', background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', borderRadius: '4px' }
};

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.msg); // "If an account with this email exists..."
    } catch (err) {
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center' }}>Forgot Password</h2>
      {message ? (
        <p style={styles.message}>{message}</p>
      ) : (
        <form onSubmit={onSubmit}>
          <p>Enter your email address and we will send you a link to reset your password.</p>
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Submit</button>
        </form>
      )}
      <p style={styles.linkText}>
        Remembered your password? <Link to="/">Login here</Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;