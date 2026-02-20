import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, requireAdmin = false, requireDoctor = false }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    // Show loading while checking authentication
    // This prevents the flash of redirect during token validation
    if (loading) {
        return <Loading text="Checking authentication..." />;
    }

    // Not logged in — redirect to appropriate login page
    if (!isAuthenticated) {
        const isAdminRoute = requireAdmin ||
            (location.pathname.startsWith('/admin') && location.pathname !== '/admin-login');
        const loginPath = isAdminRoute ? '/admin-login' : '/login';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Superusers should always be in admin panel, not on user pages
    if (user?.is_superuser && !location.pathname.startsWith('/admin')) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Non-admin trying to access admin pages — redirect to admin login with error
    const isSuperUser = user?.is_superuser;
    if (requireAdmin && !isSuperUser) {
        return <Navigate
            to="/admin-login"
            state={{ error: 'Access denied. You must be an administrator to view this page.' }}
            replace
        />;
    }

    // Route requires doctor/staff access (e.g., Dashboard)
    const isDoctor = user?.is_staff;
    if (requireDoctor && !isDoctor && !isSuperUser) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
