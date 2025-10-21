// frontend/src/pages/PtoPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PtoRequestForm from '../components/pto/PtoRequestForm';
import MyRequestsList from '../components/pto/MyRequestsList';
import PendingRequests from '../components/pto/PendingRequests';
import './PtoPage.css'; // Assuming you create this CSS file

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

function PtoPage() {
  const { user, token } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return; // Don't fetch if not logged in
    setLoading(true);
    try {
      const myRes = await fetch(`${API_URL}/api/pto/my-requests`, { headers: { 'x-auth-token': token } }); // Use API_URL
      const myData = await myRes.json();
      setMyRequests(myData);

      if (user.role === 'manager') {
        const pendingRes = await fetch(`${API_URL}/api/pto/pending`, { headers: { 'x-auth-token': token } }); // Use API_URL
        const pendingData = await pendingRes.json();
        setPendingRequests(pendingData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, user.role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="pto-page-container">Loading...</div>; // Add className

  return (
    <div className="pto-page-container"> {/* Add className */}
      <h2>PTO & Time Off</h2>
      <PtoRequestForm onPtoRequest={fetchData} />
      {user.role === 'manager' && (<PendingRequests requests={pendingRequests} onAction={fetchData} />)}
      <MyRequestsList requests={myRequests} />
    </div>
  );
}
export default PtoPage;