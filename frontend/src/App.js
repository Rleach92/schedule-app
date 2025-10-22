// src/App.js

import React, { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SchedulePage from './pages/SchedulePage';
import PtoPage from './pages/PtoPage';
import SwapDashboardPage from './pages/SwapDashboardPage';
import ProfilePage from './pages/ProfilePage';
import MonthlySchedulePage from './pages/MonthlySchedulePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ManageStaffPage from './pages/ManageStaffPage';

function App() {
  // 1. Define the state variable to trigger a global refresh
  const [globalRefreshKey, setGlobalRefreshKey] = useState(0); 

  // 2. Define the function to update the key
  const triggerGlobalDataRefresh = useCallback(() => {
    setGlobalRefreshKey(prev => prev + 1);
  }, []);

  return (
    <AuthProvider>
      <Navbar />
      <div style={{ paddingTop: '60px' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* FIX 1: Pass the refresh function down to SchedulePage */}
          <Route 
            path="/schedule" 
            element={
              <ProtectedRoute>
                <SchedulePage onGlobalDataChange={triggerGlobalDataRefresh} /> 
              </ProtectedRoute>
            } 
          />
          
          {/* FIX 2: Pass the refresh key down to MonthlySchedulePage */}
          <Route 
            path="/monthly-schedule" 
            element={
              <ProtectedRoute>
                <MonthlySchedulePage globalRefreshKey={globalRefreshKey} /> 
              </ProtectedRoute>
            } 
          />

          <Route path="/pto" element={<ProtectedRoute><PtoPage /></ProtectedRoute>} />
          <Route path="/swaps" element={<ProtectedRoute><SwapDashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/manage-staff" element={<ProtectedRoute><ManageStaffPage /></ProtectedRoute>} />

        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;