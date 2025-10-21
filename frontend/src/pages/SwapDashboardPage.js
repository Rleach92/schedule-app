// frontend/src/pages/SwapDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MySwapRequests from '../components/swaps/MySwapRequests';
import ManagerSwapQueue from '../components/swaps/ManagerSwapQueue';

const styles = {
  container: {
    width: '90%',
    maxWidth: '900px',
    margin: '20px auto',
    fontFamily: 'Arial, sans-serif',
  },
};

function SwapDashboardPage() {
  const { user, token } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [managerQueue, setManagerQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user's requests
      const myRes = await fetch('http://localhost:5000/api/swaps/my-requests', {
        headers: { 'x-auth-token': token },
      });
      const myData = await myRes.json();
      setMyRequests(myData);

      // If user is a manager, fetch the approval queue
      if (user.role === 'manager') {
        const managerRes = await fetch('http://localhost:5000/api/swaps/pending-approval', {
          headers: { 'x-auth-token': token },
        });
        const managerData = await managerRes.json();
        setManagerQueue(managerData);
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
      <h2>Shift Swap Dashboard</h2>
      
      {/* Manager's View */}
      {user.role === 'manager' && (
        <ManagerSwapQueue requests={managerQueue} onAction={fetchData} />
      )}

      {/* Employee's View */}
      <MySwapRequests requests={myRequests} onAction={fetchData} />

    </div>
  );
}

export default SwapDashboardPage;