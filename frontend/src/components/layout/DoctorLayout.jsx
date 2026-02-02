import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DoctorLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Doctor Navbar */}
            <nav style={{
                backgroundColor: 'white',
                borderBottom: '1px solid #e2e8f0',
                padding: '0.75rem 0',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '0 2rem'
                }}>
                    {/* Logo */}
                    <Link to="/dashboard" style={{
                        textDecoration: 'none',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: '1.5rem',
                        background: 'linear-gradient(to right, #2563eb, #10b981)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        <i className="fas fa-hospital" style={{
                            background: 'linear-gradient(to right, #2563eb, #10b981)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}></i>
                        City Hospital
                        <span style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#dbeafe',
                            color: '#2563eb',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontWeight: 600,
                            marginLeft: '0.5rem',
                            WebkitTextFillColor: '#2563eb'
                        }}>
                            Doctor Portal
                        </span>
                    </Link>

                    {/* User Menu */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                color: '#1e293b',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700
                            }}>
                                {user?.username?.charAt(0).toUpperCase() || 'D'}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                    Dr. {user?.username || 'Doctor'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    Doctor
                                </div>
                            </div>
                            <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem', color: '#64748b' }}></i>
                        </button>

                        {/* Dropdown */}
                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 0.5rem)',
                                right: 0,
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                minWidth: '200px',
                                overflow: 'hidden',
                                border: '1px solid #e2e8f0',
                                zIndex: 1001,
                            }}>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setDropdownOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        color: '#1e293b',
                                        textDecoration: 'none',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <i className="fas fa-th-large" style={{ color: '#2563eb' }}></i>
                                    Dashboard
                                </Link>
                                <div style={{ borderTop: '1px solid #e2e8f0', margin: '0.25rem 0' }}></div>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        width: '100%',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <i className="fas fa-sign-out-alt"></i>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ padding: '2rem 0' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                    {children || <Outlet />}
                </div>
            </main>
        </div>
    );
};

export default DoctorLayout;
