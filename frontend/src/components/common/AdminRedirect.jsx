import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Component that redirects admins to the admin panel
 * This ensures admins only see the admin interface, not the user interface
 */
const AdminRedirect = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // If user is logged in and is an admin, redirect to admin dashboard
        if (isAuthenticated && (user?.is_staff || user?.is_superuser)) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [user, isAuthenticated, navigate]);

    // Don't render anything while redirecting
    if (isAuthenticated && (user?.is_staff || user?.is_superuser)) {
        return null;
    }

    // Render children for non-admin users
    return <>{children}</>;
};

export default AdminRedirect;
