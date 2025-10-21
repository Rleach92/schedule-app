// frontend/src/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: { width: '300px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '10px', margin: '10px 0', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' },
  button: { width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
};

function ResetPasswordPage() {
  const { token } = useParams(); // Gets the :token from the URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // We'll use the login function from AuthContext to save the new token
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.msg || 'Failed to reset password');
      }

      // SUCCESS! The backend sent us a new login token.
      alert('Password reset successfully! You are now logged in.');
      
      // Save the new token in localStorage and redirect
      localStorage.setItem('token', data.token);
      // We call navigate *before* loadUser to trigger a full auth refresh
      navigate('/dashboard'); 
      window.location.reload(); // Force a reload to ensure context updates
      
    } catch (err) {
      alert(err.message); // "Token is invalid or has expired"
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center' }}>Reset Password</h2>
      <form onSubmit={onSubmit}>
        <input
          type="password"
          placeholder="New Password (min. 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Set New Password</button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;