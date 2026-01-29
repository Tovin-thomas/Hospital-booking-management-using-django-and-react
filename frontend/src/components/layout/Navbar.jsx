import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    // Hide navigation links on auth pages
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const isDoctor = user?.role === 'doctor';

    const navLinkStyle = {
        color: '#64748b',
        textDecoration: 'none',
        fontWeight: 500,
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        display: 'inline-block',
    };

    const activeNavLinkStyle = {
        ...navLinkStyle,
        color: '#2563eb',
        backgroundColor: '#dbeafe',
    };

    return (
        <nav style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            padding: '0.75rem 0',
            transition: 'all 0.3s ease',
        }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Brand Logo with Gradient */}
                    <Link to="/" style={{
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
                    </Link>

                    {/* Desktop Navigation */}
                    {!isAuthPage && !isDoctor && (
                        <div style={{
                            display: 'none',
                            gap: '0.5rem',
                            alignItems: 'center',
                        }} className="desktop-nav">
                            <NavLink to="/" style={({ isActive }) => isActive ? activeNavLinkStyle : navLinkStyle}>
                                Home
                            </NavLink>
                            <NavLink to="/about" style={({ isActive }) => isActive ? activeNavLinkStyle : navLinkStyle}>
                                About
                            </NavLink>
                            <NavLink to="/doctors" style={({ isActive }) => isActive ? activeNavLinkStyle : navLinkStyle}>
                                Doctors
                            </NavLink>
                            <NavLink to="/departments" style={({ isActive }) => isActive ? activeNavLinkStyle : navLinkStyle}>
                                Departments
                            </NavLink>
                            <NavLink to="/contact" style={({ isActive }) => isActive ? activeNavLinkStyle : navLinkStyle}>
                                Contact
                            </NavLink>
                        </div>
                    )}

                    {/* Right Side - Auth & CTA */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {isAuthenticated ? (
                            <>
                                {/* User Dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            color: '#64748b',
                                            fontWeight: 500,
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                                            e.currentTarget.style.color = '#2563eb';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#64748b';
                                        }}
                                    >
                                        <i className="fas fa-user-circle" style={{ fontSize: '1.25rem' }}></i>
                                        <span>Hello, {user?.username || user?.first_name}</span>
                                        <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem' }}></i>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {userDropdownOpen && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 0.5rem)',
                                            right: 0,
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                                            minWidth: '200px',
                                            overflow: 'hidden',
                                            border: '1px solid #e2e8f0',
                                            zIndex: 1001,
                                        }}>
                                            <Link
                                                to="/my-bookings"
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
                                                onClick={() => setUserDropdownOpen(false)}
                                            >
                                                <i className="fas fa-calendar-check" style={{ color: '#2563eb' }}></i>
                                                My Appointments
                                            </Link>

                                            {/* Dashboard only for admins and doctors */}
                                            {(user?.is_staff || user?.is_superuser) && (
                                                <Link
                                                    to="/dashboard"
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
                                                    onClick={() => setUserDropdownOpen(false)}
                                                >
                                                    <i className="fas fa-th-large" style={{ color: '#2563eb' }}></i>
                                                    Dashboard
                                                </Link>
                                            )}
                                            <div style={{ borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }}></div>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setUserDropdownOpen(false);
                                                }}
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

                                {/* Book Appointment CTA */}
                                {!isAuthPage && !isDoctor && (
                                    <Link to="/doctors" className="btn btn-primary" style={{
                                        padding: '0.75rem 1.5rem',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                                    }}>
                                        Book Appointment
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link to="/login" style={{
                                    ...navLinkStyle,
                                    display: 'none',
                                }} className="desktop-only">
                                    Login
                                </Link>
                                {!isAuthPage && (
                                    <Link to="/doctors" className="btn btn-primary" style={{
                                        padding: '0.75rem 1.5rem',
                                        fontWeight: 600,
                                    }}>
                                        Book Appointment
                                    </Link>
                                )}
                            </>
                        )}

                        {/* Mobile Menu Toggle */}
                        {!isAuthPage && !isDoctor && (
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                style={{
                                    display: 'none',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                }}
                                className="mobile-toggle"
                            >
                                <i className={`fas fa-${mobileMenuOpen ? 'times' : 'bars'}`}></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && !isAuthPage && !isDoctor && (
                    <div style={{
                        display: 'none',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #e2e8f0',
                    }} className="mobile-menu">
                        <NavLink to="/" style={({ isActive }) => ({ ...navLinkStyle, display: 'block', ...(isActive ? { color: '#2563eb', backgroundColor: '#dbeafe' } : {}) })}>
                            Home
                        </NavLink>
                        <NavLink to="/about" style={({ isActive }) => ({ ...navLinkStyle, display: 'block', ...(isActive ? { color: '#2563eb', backgroundColor: '#dbeafe' } : {}) })}>
                            About
                        </NavLink>
                        <NavLink to="/doctors" style={({ isActive }) => ({ ...navLinkStyle, display: 'block', ...(isActive ? { color: '#2563eb', backgroundColor: '#dbeafe' } : {}) })}>
                            Doctors
                        </NavLink>
                        <NavLink to="/departments" style={({ isActive }) => ({ ...navLinkStyle, display: 'block', ...(isActive ? { color: '#2563eb', backgroundColor: '#dbeafe' } : {}) })}>
                            Departments
                        </NavLink>
                        <NavLink to="/contact" style={({ isActive }) => ({ ...navLinkStyle, display: 'block', ...(isActive ? { color: '#2563eb', backgroundColor: '#dbeafe' } : {}) })}>
                            Contact
                        </NavLink>
                        {!isAuthenticated && (
                            <Link to="/login" style={{ ...navLinkStyle, display: 'block' }}>
                                Login
                            </Link>
                        )}
                    </div>
                )}
            </div>

            <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-only {
            display: inline-block !important;
          }
          .mobile-toggle {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .mobile-toggle {
            display: block !important;
          }
          .mobile-menu {
            display: flex !important;
          }
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
