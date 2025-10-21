// frontend/src/components/swaps/ManagerSwapQueue.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './ManagerSwapQueue.css';

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

const formatShift = (swap, shiftLetter) => { /* ... Keep existing function ... */ };

function ManagerSwapQueue({ requests, onAction }) {
  const { token } = useAuth();

  const handleManagerResponse = async (id, response) => {
    try {
      if (!token) throw new Error("Authentication token missing.");
      const res = await fetch(`${API_URL}/api/swaps/respond/manager/${id}`, { // Use API_URL
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify({ response }),
      });
      if (!res.ok) throw new Error('Failed respond');
      onAction();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="manager-queue-container">
      <h3>Manager Approval Queue</h3>
      {requests.length === 0 ? ( <p className="manager-queue-none">No swaps awaiting approval.</p> ) : (
        <ul className="manager-queue-list">
          {requests.map((swap) => ( <li key={swap._id} className="manager-queue-item"><p><strong>{swap.requestingUserName}</strong> wants to swap with <strong>{swap.targetUserName}</strong></p><p><strong>{swap.requestingUserName}'s Shift:</strong> {formatShift(swap, 'A')}<br /><strong>{swap.targetUserName}'s Shift:</strong> {formatShift(swap, 'B')}</p><div className="manager-queue-actions"><button onClick={() => handleManagerResponse(swap._id, 'approve')} className="manager-queue-approve-btn">Approve</button><button onClick={() => handleManagerResponse(swap._id, 'deny')} className="manager-queue-deny-btn">Deny</button></div></li> ))}
        </ul>
      )}
    </div>
  );
}
export default ManagerSwapQueue;