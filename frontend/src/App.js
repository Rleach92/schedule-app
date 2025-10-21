// src/App.js
import React from 'react';
// --- ENSURE ALL THESE IMPORTS ARE PRESENT ---
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
import ManageStaffPage from './pages/ManageStaffPage'; // Import ManageStaffPage
// --- END IMPORTS ---

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <div style={{ paddingTop: '60px' }}> {/* Adjusts content below fixed navbar */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
          <Route path="/monthly-schedule" element={<ProtectedRoute><MonthlySchedulePage /></ProtectedRoute>} />
          <Route path="/pto" element={<ProtectedRoute><PtoPage /></ProtectedRoute>} />
          <Route path="/swaps" element={<ProtectedRoute><SwapDashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          {/* Add Manage Staff Route */}
          <Route path="/manage-staff" element={<ProtectedRoute><ManageStaffPage /></ProtectedRoute>} />

        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;