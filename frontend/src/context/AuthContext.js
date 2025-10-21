// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the context
const AuthContext = createContext();

// Helper function to get the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    const currentToken = localStorage.getItem('token'); // Read directly from storage
    if (!currentToken) return; // Don't fetch if no token
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'x-auth-token': currentToken
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else {
         // If token is bad during notification fetch, clear user state
         if (res.status === 401) {
             console.error("Auth token invalid during notification fetch.");
             logout(); // Use logout function to clear everything
         }
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, []); // Empty dependency array, relies on localStorage

  // Mark notification as read
  const markNotificationAsRead = async (id) => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;
    try {
      await fetch(`http://localhost:5000/api/notifications/read/${id}`, {
        method: 'PUT',
        headers: { 'x-auth-token': currentToken }
      });
      // Refresh the list after marking as read
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  // Load user data
  const loadUser = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      try {
        const res = await fetch('http://localhost:5000/api/auth', {
          method: 'GET',
          headers: { 'x-auth-token': currentToken }
        });

        if (!res.ok) {
          // Explicitly check for 401
          if (res.status === 401) {
            console.log("loadUser: Token invalid or expired.");
          } else {
             console.error(`loadUser: Server error ${res.status}`);
          }
          throw new Error('Failed to load user'); // Trigger catch block
        }

        const userData = await res.json();
        setUser(userData);
        fetchNotifications(); // Fetch notifications *after* confirming user is valid
        
      } catch (err) {
        console.error(err);
        // If token is bad or any error occurs loading user, log them out
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setNotifications([]); // Clear notifications too
      } finally {
        setLoading(false);
      }
    } else {
      console.log("loadUser: No token found.");
      setLoading(false); // No token, stop loading
      setUser(null); // Ensure user is null if no token
      setNotifications([]); // Ensure notifications are clear if no token
    }
  }, [fetchNotifications]); // Dependency

  // Effect runs on mount and when loadUser function reference changes (rarely)
  useEffect(() => {
    console.log("AuthProvider mounted or loadUser changed. Running loadUser.");
    loadUser(); // Load user on initial mount

    // Set up polling interval for notifications
    const interval = setInterval(() => {
      // Only fetch notifications if a token exists
      if (localStorage.getItem('token')) {
        fetchNotifications();
      }
    }, 60000); // Poll every 60 seconds

    // Clear interval on component unmount
    return () => clearInterval(interval);
    
  }, [loadUser, fetchNotifications]); // Include fetchNotifications


  // Login User
  const login = async (email, password) => {
    try {
      setLoading(true); // Indicate loading during login attempt
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token); // Update token state
      // Instead of navigating immediately, let loadUser handle fetching user data and notifications
      await loadUser(); // Explicitly call loadUser after setting token
      navigate('/dashboard'); // Navigate only after user data is loaded

    } catch (err) {
      alert(err.message);
      setLoading(false); // Stop loading on error
    }
  };

  // Register User
  const register = async (formData) => {
     try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'Registration failed');
      }
      alert('Registration successful! Please log in.');
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  // Logout User
  const logout = () => {
    console.log("Logging out.");
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setNotifications([]); // Clear notifications on logout
    navigate('/');
  };

  // The value to share with all components
  const value = {
    user,
    token,
    loading,
    notifications,
    fetchNotifications,
    markNotificationAsRead,
    login,
    logout,
    register,
    loadUser // Expose loadUser if needed elsewhere
  };

  // Return the provider
  return (
    <AuthContext.Provider value={value}>
      {/* Only render children when initial loading is complete */}
      {!loading && children} 
    </AuthContext.Provider>
  );
};