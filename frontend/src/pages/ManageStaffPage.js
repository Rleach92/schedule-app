// frontend/src/pages/ManageStaffPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './ManageStaffPage.css'; // We'll create this CSS file

function ManageStaffPage() {
  const { user, token } = useAuth(); // Get current user and token
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch staff list
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { 'x-auth-token': token },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch staff list');
      }
      const data = await res.json();
      setStaffList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Ensure only managers can access (though backend also protects)
    if (user.role === 'manager') {
      fetchStaff();
    } else {
      setError('Access Denied: Managers only.');
      setLoading(false);
    }
  }, [fetchStaff, user.role]);

  // Handle delete action
  const handleDeleteUser = async (userIdToDelete, userName) => {
    if (window.confirm(`Are you sure you want to permanently delete the account for ${userName}? This cannot be undone.`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${userIdToDelete}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.msg || 'Failed to delete user');
        }
        alert(data.msg); // Show success message
        fetchStaff(); // Refresh the list
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  if (loading) {
    return <div className="manage-staff-container"><p>Loading staff list...</p></div>;
  }

  if (error) {
    return <div className="manage-staff-container"><p className="error-message">{error}</p></div>;
  }

  // Ensure only managers see the content (double check)
  if (user.role !== 'manager') {
      return <div className="manage-staff-container"><p className="error-message">Access Denied.</p></div>;
  }

  return (
    <div className="manage-staff-container">
      <h2>Manage Staff Accounts</h2>
      <p>Here you can view and remove user accounts.</p>

      <table className="staff-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map((staffMember) => (
            <tr key={staffMember._id}>
              <td>{staffMember.name}</td>
              <td>{staffMember.email}</td>
              <td>{staffMember.role}</td>
              <td>
                {/* Disable delete button for the manager's own account */}
                {staffMember._id === user._id ? (
                  <span className="self-delete-disabled">Cannot delete self</span>
                ) : (
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteUser(staffMember._id, staffMember.name)}
                  >
                    Delete User
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageStaffPage;