import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Component that redirects admins and doctors away from patient pages
 * - Admins (is_superuser) are redirected to /admin/dashboard
 * - Doctors (is_staff but not superuser, or role === 'doctor') are redirected to /dashboard
 * - Regular patients can access all user pages
 */
const AdminRedirect = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine user type
    const isAdmin = user?.is_superuser;
    const isDoctor = user?.role === 'doctor' || (user?.is_staff && !user?.is_superuser);

    // Pages that doctors/admins should NOT access (patient-facing pages)
    const patientOnlyPaths = ['/', '/about', '/doctors', '/departments', '/contact', '/booking'];
    const isPatientPage = patientOnlyPaths.some(path =>
        location.pathname === path || location.pathname.startsWith('/booking/')
    );

    useEffect(() => {
        // Wait for auth to load
        if (loading) return;

        // Redirect SUPERUSERS (admins) to admin dashboard
        if (isAuthenticated && isAdmin && isPatientPage) {
            navigate('/admin/dashboard', { replace: true });
            return;
        }

        // Redirect DOCTORS to doctor dashboard
        if (isAuthenticated && isDoctor && isPatientPage) {
            navigate('/dashboard', { replace: true });
            return;
        }
    }, [user, isAuthenticated, loading, isAdmin, isDoctor, isPatientPage, navigate]);

    // Don't render anything while redirecting
    if (isAuthenticated && !loading && (isAdmin || isDoctor) && isPatientPage) {
        return null;
    }

    // Render children for patients or on non-patient pages
    return <>{children}</>;
};

export default AdminRedirect;
