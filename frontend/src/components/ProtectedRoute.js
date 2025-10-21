// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Import

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth(); // 2. Get user and loading state

    // 3. Show a loading message
    if (loading) {
        return <div>Loading...</div>;
    }

    // 4. If not loading and no user, redirect
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // 5. If user exists, show the page
    return children;
}

export default ProtectedRoute;