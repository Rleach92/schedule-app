// src/components/Dashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // 1. Import CSS

// 2. Delete styles object

function Dashboard() {
    const { user, logout } = useAuth();

    if (!user) {
        // Keep loading state minimal as AuthContext handles initial load
        return <div>Loading...</div>;
    }

    // 3. Use className for styling
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-welcome">
                    <h2>Welcome, {user.name}</h2>
                    <p>Your role is: {user.role}</p>
                </div>
                <button onClick={logout} className="dashboard-logout-button">Logout</button>
            </div>

            <div className="dashboard-nav-container">
                <Link to="/schedule" className="dashboard-nav-link">
                    View Schedule
                </Link>
                <Link to="/pto" className="dashboard-nav-link">
                    Time Off Requests
                </Link>
                <Link to="/swaps" className="dashboard-nav-link">
                    Shift Swaps
                </Link>
            </div>

            {user.role === 'manager' && (
                <div className="manager-panel">
                    <h3>Manager Panel</h3>
                    <p>You can upload schedules, manage PTO, and approve shift swaps.</p>
                </div>
            )}
        </div>
    );
}

export default Dashboard;