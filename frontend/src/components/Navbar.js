// frontend/src/components/Navbar.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const { user, logout, notifications, markNotificationAsRead } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false); // Renamed for clarity
  const [isMenuOpen, setIsMenuOpen] = useState(false); // NEW STATE for hamburger menu
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification._id);
    setIsNotifOpen(false);
    navigate(notification.link);
  };
  
  const handleLinkClick = () => {
      setIsMenuOpen(false); // Close menu when a link is clicked
  };

  if (!user) return null;

  const totalLinks = (
      <>
        <Link to="/dashboard" className="nav-link" onClick={handleLinkClick}>Dashboard</Link>
        <Link to="/schedule" className="nav-link" onClick={handleLinkClick}>Weekly Schedule</Link>
        <Link to="/monthly-schedule" className="nav-link" onClick={handleLinkClick}>Monthly Schedule</Link>
        <Link to="/pto" className="nav-link" onClick={handleLinkClick}>Time Off</Link>
        <Link to="/swaps" className="nav-link" onClick={handleLinkClick}>Shift Swaps</Link>

        {/* --- MANAGER-ONLY LINK --- */}
        {user.role === 'manager' && (
            <Link to="/manage-staff" className="nav-link" onClick={handleLinkClick}>Manage Staff</Link>
        )}
        {/* --------------------------- */}
      </>
  );

  return (
    <nav className="navbar">
      
      {/* 🐛 MOBILE FIX: Hamburger Icon/Button */}
      <button 
          className="hamburger" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-menu"
      >
        &#9776;
      </button>

      {/* --- DESKTOP LINKS CONTAINER (Hidden on mobile) --- */}
      <div className="nav-links">
        {totalLinks}
      </div>

      {/* --- MOBILE MENU OVERLAY (Visible only when isMenuOpen is true) --- */}
      {isMenuOpen && (
          <div className="mobile-menu-overlay" id="mobile-nav-menu">
            {totalLinks}
          </div>
      )}
      
      <div className="right-menu">
        <div className="bell-container" onClick={() => setIsNotifOpen(!isNotifOpen)}> {/* Renamed state */}
          <span className="bell-icon">🔔</span>
          {notifications.length > 0 && (
            <span className="badge">{notifications.length}</span>
          )}
        </div>

        {/* Renamed state */}
        {isNotifOpen && (
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