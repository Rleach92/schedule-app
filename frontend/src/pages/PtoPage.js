// frontend/src/pages/PtoPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PtoRequestForm from '../components/pto/PtoRequestForm';
import MyRequestsList from '../components/pto/MyRequestsList';
import PendingRequests from '../components/pto/PendingRequests';

const styles = {
  container: {
    width: '90%',
    maxWidth: '900px',
    margin: '20px auto',
    fontFamily: 'Arial, sans-serif',
  },
};

function PtoPage() {
  const { user, token } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user's requests
      const myRes = await fetch('http://localhost:5000/api/pto/my-requests', {
        headers: { 'x-auth-token': token },
      });
      const myData = await myRes.json();
      setMyRequests(myData);

      // If user is a manager, fetch pending requests
      if (user.role === 'manager') {
        const pendingRes = await fetch('http://localhost:5000/api/pto/pending', {
          headers: { 'x-auth-token': token },
        });
        const pendingData = await pendingRes.json();
        setPendingRequests(pendingData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, user.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h2>PTO & Time Off</h2>
      
      {/* 1. The Form (for everyone) */}
      <PtoRequestForm onPtoRequest={fetchData} />

      {/* 2. Manager's View */}
      {user.role === 'manager' && (
        <PendingRequests requests={pendingRequests} onAction={fetchData} />
      )}

      {/* 3. Employee's List */}
      <MyRequestsList requests={myRequests} />
    </div>
  );
}

export default PtoPage;