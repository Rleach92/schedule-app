// src/components/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css'; // Assuming CSS file exists

// The API URL definition is NOT needed here if you correctly updated AuthContext.js

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { login } = useAuth();
  
  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    await login(email, password); 
  };

  // Use className for styling
  return (
    <div className="login-container">
      <h2 className="login-header">Login</h2>
      <form onSubmit={onSubmit} className="login-form">
        <input 
          type="email" 
          placeholder="Email Address" 
          name="email" 
          value={email} 
          onChange={onChange} 
          required 
          className="login-input" 
        />
        <input 
          type="password" 
          placeholder="Password" 
          name="password" 
          value={password} 
          onChange={onChange} 
          required 
          className="login-input" 
        />
        <button type="submit" className="login-button">Login</button>
      </form>
      
      <div className="login-link-container">
        <Link to="/forgot-password">Forgot Password?</Link>
        <Link to="/register">Register here</Link>
      </div>

    </div>
  );
}

export default Login;