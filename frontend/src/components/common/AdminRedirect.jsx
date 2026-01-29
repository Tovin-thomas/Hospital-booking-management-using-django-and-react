import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Component that redirects admins to the admin panel
 * This ensures admins only see the admin interface, not the user interface
 * Note: Doctors (is_staff) can still access user pages, only superusers are redirected
 */
const AdminRedirect = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Only redirect SUPERUSERS (admins), not regular staff (doctors)
        if (isAuthenticated && user?.is_superuser) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [user, isAuthenticated, navigate]);

    // Don't render anything while redirecting superusers
    if (isAuthenticated && user?.is_superuser) {
        return null;
    }

    // Render children for non-admin users (including doctors)
    return <>{children}</>;
};

export default AdminRedirect;
