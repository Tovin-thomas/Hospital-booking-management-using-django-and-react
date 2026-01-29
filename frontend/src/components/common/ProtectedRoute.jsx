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

    // Only redirect SUPERUSERS to admin panel
    // Staff (Doctors) should be allowed to access the normal dashboard/pages
    if (user?.is_superuser && !location.pathname.startsWith('/admin')) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Non-admin trying to access admin pages
    // Strictly require SUPERUSER for admin routes
    const isSuperUser = user?.is_superuser;
    if (requireAdmin && !isSuperUser) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
