// frontend/src/pages/ProfilePage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css'; // Assuming you create this

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

function ProfilePage() {
  const { user, token, loadUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users/me/details`, { // Use API_URL
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to update details');
      alert('Name updated!'); loadUser();
    } catch (err) { alert(err.message); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { /*...*/ return; }
    if (passwords.newPassword.length < 6) { /*...*/ return; }
    try {
      const res = await fetch(`${API_URL}/api/users/me/password`, { // Use API_URL
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.msg || 'Failed password update'); }
      alert('Password updated!'); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="profile-container"> {/* Add className */}
      <h2>My Profile</h2>
      <div className="profile-form-box"> {/* Add className */}
        <h4>Update My Details</h4>
        <form onSubmit={handleDetailsSubmit} className="profile-form"> {/* Add className */}
          <label>Email (cannot be changed)</label>
          <input type="email" value={user.email} disabled className="profile-input disabled" /> {/* Add className */}
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="profile-input" /> {/* Add className */}
          <button type="submit" className="profile-button">Save Name</button> {/* Add className */}
        </form>
      </div>
      <div className="profile-form-box"> {/* Add className */}
        <h4>Change My Password</h4>
        <form onSubmit={handlePasswordSubmit} className="profile-form"> {/* Add className */}
          <input type="password" placeholder="Current Password" value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} className="profile-input" required /> {/* Add className */}
          <input type="password" placeholder="New Password (min. 6)" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="profile-input" required /> {/* Add className */}
          <input type="password" placeholder="Confirm New Password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} className="profile-input" required /> {/* Add className */}
          <button type="submit" className="profile-button">Change Password</button> {/* Add className */}
        </form>
      </div>
    </div>
  );
}
export default ProfilePage;