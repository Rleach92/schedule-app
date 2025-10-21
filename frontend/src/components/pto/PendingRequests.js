// frontend/src/components/pto/PendingRequests.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './PendingRequests.css';

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

const formatDate = (dateString) => { /* ... Keep existing function ... */ };

function PendingRequests({ requests, onAction }) {
  const { token } = useAuth();

  const handleResponse = async (id, status) => {
    try {
      if (!token) throw new Error("Authentication token missing.");
      const res = await fetch(`${API_URL}/api/pto/respond/${id}`, { // Use API_URL
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed respond request');
      onAction();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="pending-requests-container">
      <h3>Pending PTO Requests</h3>
      {requests.length === 0 ? ( <p className="pending-requests-none">No pending requests.</p> ) : (
        <ul className="pending-requests-list">
          {requests.map((req) => ( <li key={req._id} className="pending-requests-item"><div><strong>{req.userName}</strong> - {formatDate(req.date)}<span className="reason-text">Reason: {req.reason || '(None)'}</span></div><div className="pending-requests-actions"><button onClick={() => handleResponse(req._id, 'approved')} className="pending-requests-approve-btn">Approve</button><button onClick={() => handleResponse(req._id, 'denied')} className="pending-requests-deny-btn">Deny</button></div></li> ))}
        </ul>
      )}
    </div>
  );
}
export default PendingRequests;