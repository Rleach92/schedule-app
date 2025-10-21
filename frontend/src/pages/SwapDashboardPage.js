// frontend/src/pages/SwapDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MySwapRequests from '../components/swaps/MySwapRequests';
import ManagerSwapQueue from '../components/swaps/ManagerSwapQueue';
import './SwapDashboardPage.css'; // Assuming you create this CSS file

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

function SwapDashboardPage() {
  const { user, token } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [managerQueue, setManagerQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const myRes = await fetch(`${API_URL}/api/swaps/my-requests`, { headers: { 'x-auth-token': token } }); // Use API_URL
      const myData = await myRes.json();
      setMyRequests(myData);

      if (user.role === 'manager') {
        const managerRes = await fetch(`${API_URL}/api/swaps/pending-approval`, { headers: { 'x-auth-token': token } }); // Use API_URL
        const managerData = await managerRes.json();
        setManagerQueue(managerData);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token, user.role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="swap-dashboard-container">Loading...</div>; // Add className

  return (
    <div className="swap-dashboard-container"> {/* Add className */}
      <h2>Shift Swap Dashboard</h2>
      {user.role === 'manager' && (<ManagerSwapQueue requests={managerQueue} onAction={fetchData} />)}
      <MySwapRequests requests={myRequests} onAction={fetchData} />
    </div>
  );
}
export default SwapDashboardPage;