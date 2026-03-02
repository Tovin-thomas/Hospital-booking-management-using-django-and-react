import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints';

// All possible menu items — each has a `permKey` that matches the backend module keys.
// Dashboard is always visible to all admins (no permKey restriction).
const ALL_MENU_ITEMS = [
    { path: '/admin/dashboard', icon: 'fas fa-chart-line', label: 'Dashboard', permKey: null },
    { path: '/admin/doctors', icon: 'fas fa-user-md', label: 'Doctors', permKey: 'doctors' },
    { path: '/admin/departments', icon: 'fas fa-hospital', label: 'Departments', permKey: 'departments' },
    { path: '/admin/bookings', icon: 'fas fa-calendar-check', label: 'Bookings', permKey: 'bookings' },
    { path: '/admin/leaves', icon: 'fas fa-calendar-times', label: 'Doctor Leaves', permKey: 'leaves' },
    { path: '/admin/users', icon: 'fas fa-users', label: 'Users', permKey: 'users' },
    { path: '/admin/contacts', icon: 'fas fa-envelope', label: 'Messages', permKey: 'contacts' },
    { path: '/admin/admins', icon: 'fas fa-user-shield', label: 'Manage Admins', permKey: 'admins' },
];

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // We fetch the admin's own permissions from the admin list endpoint.
    // Main admin (is_main_admin) gets all items; others are filtered.
    const [allowedModules, setAllowedModules] = useState(null); // null = loading / unrestricted
    const [isMainAdmin, setIsMainAdmin] = useState(false);

    useEffect(() => {
        if (!user) return;

        // Fetch dashboard stats to know if this user is the main admin
        axios.get(API_ENDPOINTS.dashboard.stats)
            .then(res => {
                const mainAdmin = res.data?.is_main_admin === true;
                setIsMainAdmin(mainAdmin);
                if (mainAdmin) {
                    setAllowedModules(null); // null = unrestricted
                } else {
                    // Fetch the admin list, find ourselves, extract our permissions
                    return axios.get(API_ENDPOINTS.admins.list).then(listRes => {
                        const self = listRes.data.find(a => a.username === user.username);
                        if (self && Array.isArray(self.allowed_modules)) {
                            setAllowedModules(self.allowed_modules);
                        } else {
                            setAllowedModules([]); // default: no access if no entry
                        }
                    });
                }
            })
            .catch(() => {
                setAllowedModules([]); // fail-safe: deny access
            });
    }, [user]);

    // Build the visible menu from permissions
    const menuItems = useMemo(() => {
        if (isMainAdmin || allowedModules === null) {
            // Main admin or still loading → show everything
            return ALL_MENU_ITEMS;
        }
        return ALL_MENU_ITEMS.filter(item =>
            item.permKey === null || allowedModules.includes(item.permKey)
        );
    }, [isMainAdmin, allowedModules]);

    const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

    // Guard: if a non-main admin navigates to a page they don't have access to, redirect them to dashboard
    useEffect(() => {
        if (isMainAdmin || allowedModules === null) return;
        const currentItem = ALL_MENU_ITEMS.find(item => location.pathname === item.path);
        if (currentItem && currentItem.permKey && !allowedModules.includes(currentItem.permKey)) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [location.pathname, allowedModules, isMainAdmin, navigate]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                backgroundColor: '#1e293b',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto'
            }}>
                {/* Logo */}
                <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                        <i className="fas fa-hospital-alt" style={{ marginRight: '0.5rem', color: '#3b82f6' }}></i>
                        Admin Panel
                    </h2>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                        Hospital Management
                    </p>
                </div>

                {/* User Info */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: isMainAdmin
                                ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                                : '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            fontWeight: 700
                        }}>
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{user?.username}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                                {isMainAdmin
                                    ? <><i className="fas fa-crown" style={{ marginRight: '0.25rem', color: '#fbbf24' }}></i>Main Administrator</>
                                    : <><i className="fas fa-user-shield" style={{ marginRight: '0.25rem', color: '#60a5fa' }}></i>Administrator</>
                                }
                            </div>
                        </div>
                    </div>
                    {/* Permissions badge for non-main admins */}
                    {!isMainAdmin && allowedModules !== null && (
                        <div style={{
                            marginTop: '0.75rem', padding: '0.4rem 0.75rem',
                            backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem',
                            fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem'
                        }}>
                            <i className="fas fa-shield-alt" style={{ color: '#60a5fa', fontSize: '0.7rem' }} />
                            {allowedModules.length === 0
                                ? 'No sections assigned'
                                : `${allowedModules.length + 1} section${allowedModules.length + 1 !== 1 ? 's' : ''} accessible`}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '1.5rem 0' }}>
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onMouseEnter={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.color = 'white';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#94a3b8';
                                }
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.875rem 1.5rem',
                                color: isActive(item.path) ? 'white' : '#94a3b8',
                                textDecoration: 'none',
                                backgroundColor: isActive(item.path) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                borderLeft: isActive(item.path) ? '4px solid #3b82f6' : '4px solid transparent',
                                transition: 'all 0.2s',
                                fontWeight: isActive(item.path) ? 600 : 400,
                                fontSize: '0.9375rem'
                            }}
                        >
                            <i className={item.icon} style={{ width: '20px', fontSize: '1.125rem' }}></i>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '0.5rem',
                            color: '#fca5a5',
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                            e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = '#fca5a5';
                        }}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Top Bar */}
                <header style={{
                    backgroundColor: 'white',
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>
                            {ALL_MENU_ITEMS.find(item => isActive(item.path))?.label || 'Admin Panel'}
                        </h1>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                            Manage your hospital system
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            <i className="fas fa-clock" style={{ marginRight: '0.5rem' }}></i>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ flex: 1, padding: '2rem' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
