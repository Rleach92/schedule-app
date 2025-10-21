// src/components/Register.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth

// ... (your styles object) ...
const styles = {
  container: { width: '300px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '10px', margin: '10px 0', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' },
  button: { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
  select: { width: '100%', padding: '10px', margin: '10px 0', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' },
  linkText: { textAlign: 'center', marginTop: '15px', fontSize: '14px' },
  managerInput: { width: '100%', padding: '10px', margin: '10px 0', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #e0a800', backgroundColor: '#fffbe6' }
};

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    managerCode: ''
  });
  
  const { register } = useAuth(); // 2. Get register function

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    // 3. Call context register function
    await register(formData);
  };

  // 4. Destructure all form fields
  const { name, email, password, role, managerCode } = formData;

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center' }}>Register</h2>
      <form onSubmit={onSubmit}>
        <input type="text" placeholder="Name" name="name" value={name} onChange={onChange} required style={styles.input} />
        {/* ... rest of your inputs ... */}
        <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required style={styles.input} />
        <input type="password" placeholder="Password (min. 6 characters)" name="password" value={password} onChange={onChange} required minLength="6" style={styles.input} />
        <select name="role" value={role} onChange={onChange} style={styles.select}>
          <option value="employee">I am an Employee</option>
          <option value="manager">I am a Manager</option>
        </select>
        
        {role === 'manager' && (
          <input
            type="password"
            placeholder="Manager Secret Code"
            name="managerCode"
            value={managerCode}
            onChange={onChange}
            required
            style={styles.managerInput}
          />
        )}
        
        <button type="submit" style={styles.button}>Register</button>
      </form>
      
      <p style={styles.linkText}>
        Already have an account? <Link to="/">Login here</Link>
      </p>
    </div>
  );
}

export default Register;