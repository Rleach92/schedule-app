// frontend/src/components/swaps/MySwapRequests.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './MySwapRequests.css';

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

const formatShift = (swap, shiftLetter) => { /* ... Keep existing function ... */ };

function MySwapRequests({ requests, onAction }) {
  const { user, token } = useAuth();

  const handleTargetResponse = async (id, response) => {
    try {
      if (!token) throw new Error("Authentication token missing.");
      const res = await fetch(`${API_URL}/api/swaps/respond/target/${id}`, { // Use API_URL
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify({ response }),
      });
      if (!res.ok) throw new Error('Failed respond');
      onAction();
    } catch (err) { alert(err.message); }
  };

  const getStatusClassName = (status) => { /* ... Keep existing function ... */ };
  const getStatusText = (swap) => { /* ... Keep existing function ... */ };

  return (
    <div className="my-swaps-container">
      <h3>My Shift Swap Requests</h3>
      {requests.length === 0 ? ( <p className="my-swaps-none">No requests.</p> ) : (
        <ul className="my-swaps-list">
          {requests.map((swap) => {
            const isTarget = swap.targetUser === user._id;
            return ( <li key={swap._id} className="my-swaps-item"><p><strong>{isTarget ? `${swap.requestingUserName} requests:` : `You requested with ${swap.targetUserName}:`}</strong></p><p><strong>Their Shift:</strong> {formatShift(swap, isTarget ? 'A' : 'B')}<br /><strong>Your Shift:</strong> {formatShift(swap, isTarget ? 'B' : 'A')}</p><p>{getStatusText(swap)}</p>{isTarget && swap.status === 'pending_target' && ( <div className="my-swaps-actions"><button onClick={() => handleTargetResponse(swap._id, 'accept')} className="my-swaps-accept-btn">Accept</button><button onClick={() => handleTargetResponse(swap._id, 'deny')} className="my-swaps-deny-btn">Deny</button></div> )}</li> );
          })}
        </ul>
      )}
    </div>
  );
}
export default MySwapRequests;