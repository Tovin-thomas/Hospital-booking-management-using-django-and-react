import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { path: '/admin/dashboard', icon: 'fas fa-chart-line', label: 'Dashboard' },
        { path: '/admin/doctors', icon: 'fas fa-user-md', label: 'Doctors' },
        { path: '/admin/departments', icon: 'fas fa-hospital', label: 'Departments' },
        { path: '/admin/bookings', icon: 'fas fa-calendar-check', label: 'Bookings' },
        { path: '/admin/users', icon: 'fas fa-users', label: 'Users' },
        { path: '/admin/contacts', icon: 'fas fa-envelope', label: 'Messages' },
    ];

    const isActive = (path) => location.pathname === path;

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
                            backgroundColor: '#3b82f6',
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
                                <i className="fas fa-crown" style={{ marginRight: '0.25rem', color: '#fbbf24' }}></i>
                                Administrator
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '1.5rem 0' }}>
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
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
                            {menuItems.find(item => isActive(item.path))?.label || 'Admin Panel'}
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
