// frontend/src/components/swaps/MySwapRequests.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
// FIX: Add formatTime12Hr import
import { formatTime12Hr } from '../../utils/date-helpers'; 
import './MySwapRequests.css';

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

// Helper moved outside
const formatShift = (swap, shiftLetter) => {
  const date = new Date(swap[`shift${shiftLetter}_date`]).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC'
  });
  
  // FIX: Use formatTime12Hr for both times
  const startTime = formatTime12Hr(swap[`shift${shiftLetter}_startTime`]);
  const endTime = formatTime12Hr(swap[`shift${shiftLetter}_endTime`]);
  
  return `${date} (${startTime} - ${endTime})`;
};

// **FIX:** Define this function here, as it's used inside getStatusText
const getStatusClassName = (status) => {
    let statusClass = 'my-swaps-status';
    if (status === 'pending_target') statusClass += ' my-swaps-status-pending_target';
    else if (status === 'pending_manager') statusClass += ' my-swaps-status-pending_manager';
    else if (status === 'approved') statusClass += ' my-swaps-status-approved';
    else if (status.startsWith('denied')) statusClass += ' my-swaps-status-denied'; // Handle both denied types
    return statusClass;
};


function MySwapRequests({ requests, onAction }) {
  const { user, token } = useAuth();
  // ... (handleTargetResponse and getStatusText functions remain the same) ...
  const handleTargetResponse = async (id, response) => {
    try {
      const res = await fetch(`${API_URL}/api/swaps/respond/target/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ response }),
      });
      if (!res.ok) throw new Error('Failed to respond');
      onAction();
    } catch (err) { alert(err.message); }
  };

  const getStatusText = (swap) => {
    const status = swap.status;
    let text = '';
    if (status === 'pending_target') {
      text = (swap.requestingUser === user._id) ?
        `Waiting for ${swap.targetUserName} to respond.` :
        `Awaiting your response.`;
    } else if (status === 'pending_manager') {
      text = `Waiting for manager approval.`;
    } else if (status === 'approved') {
      text = `Approved!`;
    } else if (status === 'denied_by_target') {
      text = `${swap.targetUserName} denied the swap.`;
    } else if (status === 'denied_by_manager') {
      text = `A manager denied the swap.`;
    } else {
      text = status;
    }
    // **FIX:** Use the getStatusClassName function here
    return <span className={getStatusClassName(status)}>{text}</span>;
  };

  return (
    <div className="my-swaps-container">
      <h3>My Shift Swap Requests</h3>
      {requests.length === 0 ? (
        <p className="my-swaps-none">You are not involved in any pending or past swap requests.</p>
      ) : (
        <ul className="my-swaps-list">
          {requests.map((swap) => {
            const isTarget = swap.targetUser === user._id;
            return (
              <li key={swap._id} className="my-swaps-item">
                <p>
                  <strong>{isTarget ? `${swap.requestingUserName} requests a swap:` : `You requested a swap with ${swap.targetUserName}:`}</strong>
                </p>
                <p>
                  {/* The display times are now 12-hour format */}
                  <strong>Their Shift:</strong> {formatShift(swap, isTarget ? 'A' : 'B')}
                  <br />
                  <strong>Your Shift:</strong> {formatShift(swap, isTarget ? 'B' : 'A')}
                </p>
                <p>{getStatusText(swap)}</p>

                {isTarget && swap.status === 'pending_target' && (
                  <div className="my-swaps-actions">
                    <button
                      onClick={() => handleTargetResponse(swap._id, 'accept')}
                      className="my-swaps-accept-btn"
                    >
                      Accept Swap
                    </button>
                    <button
                      onClick={() => handleTargetResponse(swap._id, 'deny')}
                      className="my-swaps-deny-btn"
                    >
                      Deny Swap
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default MySwapRequests;