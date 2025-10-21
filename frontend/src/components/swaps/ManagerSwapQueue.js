// frontend/src/components/swaps/ManagerSwapQueue.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './ManagerSwapQueue.css'; // 1. Import CSS

// 2. Delete styles object

// Helper moved outside
const formatShift = (swap, shiftLetter) => {
  const date = new Date(swap[`shift${shiftLetter}_date`]).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC'
  });
  return `${date} (${swap[`shift${shiftLetter}_startTime`]} - ${swap[`shift${shiftLetter}_endTime`]})`;
};

function ManagerSwapQueue({ requests, onAction }) {
  const { token } = useAuth();

  const handleManagerResponse = async (id, response) => {
    try {
      const res = await fetch(`http://localhost:5000/api/swaps/respond/manager/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ response }),
      });
      if (!res.ok) throw new Error('Failed to respond');
      onAction();
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Use className
  return (
    <div className="manager-queue-container">
      <h3>Manager Approval Queue</h3>
      {requests.length === 0 ? (
        <p className="manager-queue-none">No swaps are awaiting manager approval.</p>
      ) : (
        <ul className="manager-queue-list">
          {requests.map((swap) => (
            <li key={swap._id} className="manager-queue-item">
              <p>
                <strong>{swap.requestingUserName}</strong> wants to swap with <strong>{swap.targetUserName}</strong>
              </p>
              <p>
                <strong>{swap.requestingUserName}'s Shift:</strong> {formatShift(swap, 'A')}
                <br />
                <strong>{swap.targetUserName}'s Shift:</strong> {formatShift(swap, 'B')}
              </p>
              <div className="manager-queue-actions">
                <button
                  onClick={() => handleManagerResponse(swap._id, 'approve')}
                  className="manager-queue-approve-btn" // Use className
                >
                  Approve
                </button>
                <button
                  onClick={() => handleManagerResponse(swap._id, 'deny')}
                  className="manager-queue-deny-btn" // Use className
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

export default ManagerSwapQueue;