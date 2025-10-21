// frontend/src/pages/ProfilePage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: {
    width: '90%',
    maxWidth: '600px',
    margin: '30px auto',
    fontFamily: 'Arial, sans-serif',
  },
  formBox: {
    padding: '20px',
    background: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  button: {
    padding: '10px 16px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    alignSelf: 'flex-start',
  },
};

function ProfilePage() {
  const { user, token, loadUser } = useAuth(); // We need loadUser to refresh the name
  
  // State for the details form
  const [name, setName] = useState(user.name);
  
  // State for the password form
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/users/me/details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to update details');
      
      alert('Name updated successfully!');
      loadUser(); // This will refresh the user's name in the navbar
      
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwords.newPassword.length < 6) {
      alert('New password must be at least 6 characters long.');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/users/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ 
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || 'Failed to update password');
      }
      
      alert('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear fields
      
    } catch (err) {
      alert(err.message); // Will show "Invalid current password"
    }
  };

  return (
    <div style={styles.container}>
      <h2>My Profile</h2>
      
      {/* --- Details Form --- */}
      <div style={styles.formBox}>
        <h4>Update My Details</h4>
        <form onSubmit={handleDetailsSubmit} style={styles.form}>
          <label>Email (cannot be changed)</label>
          <input 
            type="email" 
            value={user.email} 
            disabled 
            style={{...styles.input, background: '#eee'}} 
          />
          
          <label>Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Save Name</button>
        </form>
      </div>
      
      {/* --- Password Form --- */}
      <div style={styles.formBox}>
        <h4>Change My Password</h4>
        <form onSubmit={handlePasswordSubmit} style={styles.form}>
          <input 
            type="password"
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
            style={styles.input}
            required
          />
          <input 
            type="password"
            placeholder="New Password (min. 6 characters)"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
            style={styles.input}
            required
          />
          <input 
            type="password"
            placeholder="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Change Password</button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;