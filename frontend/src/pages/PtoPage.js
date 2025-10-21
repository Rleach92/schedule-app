// frontend/src/pages/PtoPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PtoRequestForm from '../components/pto/PtoRequestForm';
import MyRequestsList from '../components/pto/MyRequestsList';
import PendingRequests from '../components/pto/PendingRequests';
import './PtoPage.css'; // 1. Import CSS

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

function PtoPage() {
  const { user, token } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Fetch user's requests
      const myRes = await fetch(`${API_URL}/api/pto/my-requests`, { headers: { 'x-auth-token': token } });
      const myData = await myRes.json();
      setMyRequests(myData);

      // If user is a manager, fetch pending requests
      if (user.role === 'manager') {
        const pendingRes = await fetch(`${API_URL}/api/pto/pending`, { headers: { 'x-auth-token': token } });
        const pendingData = await pendingRes.json();
        setPendingRequests(pendingData);
      }
    } catch (err) {
      console.error(err);
      // Optional: Set a specific error message here if the fetch fails
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]); // Use optional chaining for safety

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    // 2. Use className for loading state container
    return <div className="pto-page-container"><p>Loading...</p></div>;
  }

  return (
    // 3. Use className for main container
    <div className="pto-page-container">
      <h2>PTO & Time Off</h2>
      
      {/* The Form (for everyone) */}
      <PtoRequestForm onPtoRequest={fetchData} />

      {/* Manager's View */}
      {user.role === 'manager' && (
        <PendingRequests requests={pendingRequests} onAction={fetchData} />
      )}

      {/* Employee's List (for everyone) */}
      <MyRequestsList requests={myRequests} />
    </div>
  );
}
export default PtoPage;