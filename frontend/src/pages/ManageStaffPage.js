// frontend/src/pages/ManageStaffPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './ManageStaffPage.css';

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

function ManageStaffPage() {
  const { user, token } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStaff = useCallback(async () => {
    // Check role before fetching
     if (user?.role !== 'manager') {
       setError('Access Denied: Managers only.');
       setLoading(false);
       return;
     }
    setLoading(true); setError('');
    try {
      if (!token) throw new Error("Authentication token is missing.");
      const res = await fetch(`${API_URL}/api/users`, { headers: { 'x-auth-token': token } }); // Use API_URL
      if (!res.ok) throw new Error('Failed to fetch staff list');
      const data = await res.json(); setStaffList(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token, user?.role]); // Depend on user role

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleDeleteUser = async (userIdToDelete, userName) => {
    if (window.confirm(`Delete ${userName}?`)) {
      try {
        if (!token) throw new Error("Authentication token is missing.");
        const res = await fetch(`${API_URL}/api/users/${userIdToDelete}`, { // Use API_URL
            method: 'DELETE', headers: { 'x-auth-token': token },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Failed to delete');
        alert(data.msg); fetchStaff();
      } catch (err) { alert(`Error: ${err.message}`); }
    }
  };

  // Render loading state first
  if (loading) return <div className="manage-staff-container"><p>Loading...</p></div>;
  // Then render error/access denied
  if (error || user?.role !== 'manager') return <div className="manage-staff-container"><p className="error-message">{error || 'Access Denied.'}</p></div>;

  return (
    <div className="manage-staff-container">
      <h2>Manage Staff Accounts</h2>
      <p>View and remove user accounts.</p>
      
      {/* 🐛 MOBILE FIX: Wrap the table in a container to enable horizontal scroll on small screens */}
      <div className="staff-table-responsive-wrapper">
        <table className="staff-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {staffList.map((staffMember) => (
              <tr key={staffMember._id}>
                <td>{staffMember.name}</td><td>{staffMember.email}</td><td>{staffMember.role}</td>
                <td>
                  {staffMember._id === user._id ? ( <span className="self-delete-disabled">Cannot delete self</span> ) : (
                    <button className="delete-button" onClick={() => handleDeleteUser(staffMember._id, staffMember.name)}>Delete User</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
export default ManageStaffPage;