// frontend/src/components/Navbar.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const { user, logout, notifications, markNotificationAsRead } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification._id);
    setIsOpen(false);
    navigate(notification.link);
  };

  if (!user) return null; // Don't render if not logged in

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/schedule" className="nav-link">Weekly Schedule</Link>
        <Link to="/monthly-schedule" className="nav-link">Monthly Schedule</Link>
        <Link to="/pto" className="nav-link">Time Off</Link>
        <Link to="/swaps" className="nav-link">Shift Swaps</Link>

        {/* --- ADD MANAGER-ONLY LINK --- */}
        {user.role === 'manager' && (
            <Link to="/manage-staff" className="nav-link">Manage Staff</Link>
        )}
        {/* --------------------------- */}
      </div>

      <div className="right-menu">
        <div className="bell-container" onClick={() => setIsOpen(!isOpen)}>
          <span className="bell-icon">🔔</span>
          {notifications.length > 0 && (
            <span className="badge">{notifications.length}</span>
          )}
        </div>

        {isOpen && (
          <div className="dropdown">
            {notifications.length === 0 ? (
              <div className="no-notifications">No new notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className="notification-item"
                  onClick={() => handleNotificationClick(notif)}
                >
                  {notif.message}
                </div>
              ))
            )}
          </div>
        )}

        <Link to="/profile" className="profile-link">
          Hi, {user.name}
        </Link>

        <button onClick={logout} className="logout-button">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;