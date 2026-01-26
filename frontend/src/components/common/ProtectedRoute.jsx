import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading text="Checking authentication..." />;
    }

    // Not logged in - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const isAdmin = user?.is_staff || user?.is_superuser;

    // Admin trying to access patient pages - redirect to admin panel
    if (isAdmin && !location.pathname.startsWith('/admin')) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Non-admin trying to access admin pages
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
