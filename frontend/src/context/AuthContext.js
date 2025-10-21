// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// Define the base URL for the API
const API_URL = 'https://my-schedule-api-q374.onrender.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  
  // Define logout early as it's used in useCallback below
  const logout = useCallback(() => {
      console.log("Logging out.");
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      setNotifications([]);
      navigate('/');
  }, [navigate]); // navigate is a dependency

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { 'x-auth-token': currentToken }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else if (res.status === 401) {
        logout(); // 'logout' is used here
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  // **FIX:** Including 'logout' in the dependency array
  }, [logout]); 

  const markNotificationAsRead = async (id) => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;
    try {
      await fetch(`${API_URL}/api/notifications/read/${id}`, {
        method: 'PUT',
        headers: { 'x-auth-token': currentToken }
      });
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
        const res = await fetch(`${API_URL}/api/auth`, {
          method: 'GET',
          headers: { 'x-auth-token': currentToken }
        });

        if (!res.ok) throw new Error('Failed to load user');
        const userData = await res.json();
        setUser(userData);
        fetchNotifications();
        
      } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setUser(null);
      setNotifications([]);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    loadUser();
    const interval = setInterval(() => {
      if (localStorage.getItem('token')) {
        fetchNotifications();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [loadUser, fetchNotifications]);


  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Login failed');
      localStorage.setItem('token', data.token);
      setToken(data.token);
      await loadUser();
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Registration failed');
      alert('Registration successful! Please log in.');
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  const value = {
    user, token, loading, notifications,
    fetchNotifications, markNotificationAsRead,
    login, logout, register, loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};