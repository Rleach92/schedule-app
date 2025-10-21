// frontend/src/components/pto/MyRequestsList.js
import React from 'react';
import './MyRequestsList.css'; // 1. Import CSS

// 2. Delete styles object

// Helper moved outside component
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC', // Keep UTC to match backend storage
  });
};

function MyRequestsList({ requests }) {

  // 3. Use className strings
  const getStatusClassName = (status) => {
    return `my-requests-status my-requests-status-${status}`; // e.g., "my-requests-status my-requests-status-pending"
  };

  return (
    <div className="my-requests-container">
      <h3>My Requests</h3>
      {requests.length === 0 ? (
        <p className="my-requests-none">You have not made any PTO requests.</p>
      ) : (
        <ul className="my-requests-list">
          {requests.map((req) => (
            <li key={req._id} className="my-requests-item">
              <div>
                <strong>{formatDate(req.date)}</strong>
                {/* Add className for styling reason */}
                <span className="reason-text"> - {req.reason || '(No reason)'}</span>
              </div>
              <span className={getStatusClassName(req.status)}>{req.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyRequestsList;