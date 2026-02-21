import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

/**
 * PublicRoute - For pages that should only be accessible to non-authenticated users
 * Examples: Login, Register
 * 
 * If user is already authenticated, redirect them to their appropriate dashboard
 * Exception: /admin-login is handled by its own component to avoid redirect loops
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    // Show loading while checking authentication
    if (loading) {
        return <Loading text="Checking authentication..." />;
    }

    // Don't redirect from admin-login — AdminLogin component handles its own redirect
    // This prevents infinite redirect loops when stale tokens exist
    if (location.pathname === '/admin-login') {
        return children;
    }

    // If user is authenticated, redirect to their appropriate page
    if (isAuthenticated && user) {
        // Determine redirect based on user role
        if (user.is_superuser) {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (user.is_staff) {
            return <Navigate to="/dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    // User is not authenticated, show the public page (login/register)
    return children;
};

export default PublicRoute;
