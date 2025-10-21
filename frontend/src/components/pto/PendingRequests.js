// frontend/src/components/pto/PendingRequests.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './PendingRequests.css'; // 1. Import CSS

// 2. Delete styles object

// Helper moved outside
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

function PendingRequests({ requests, onAction }) {
  const { token } = useAuth();

  const handleResponse = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/pto/respond/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error('Failed to respond to request');
      }
      onAction();
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Use className
  return (
    <div className="pending-requests-container">
      <h3>Pending PTO Requests</h3>
      {requests.length === 0 ? (
        <p className="pending-requests-none">There are no pending requests.</p>
      ) : (
        <ul className="pending-requests-list">
          {requests.map((req) => (
            <li key={req._id} className="pending-requests-item">
              <div>
                <strong>{req.userName}</strong> - {formatDate(req.date)}
                {/* Use className for reason */}
                <span className="reason-text">Reason: {req.reason || '(No reason)'}</span>
              </div>
              <div className="pending-requests-actions">
                <button
                  onClick={() => handleResponse(req._id, 'approved')}
                  // Combine base and specific classes
                  className="pending-requests-approve-btn"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleResponse(req._id, 'denied')}
                  className="pending-requests-deny-btn" // Use specific class
                >
                  Deny
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PendingRequests;