import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            backgroundColor: '#1e293b',
            color: 'white',
            marginTop: 'auto',
            padding: '4rem 0 2rem',
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem',
                    marginBottom: '2rem',
                }}>

                    {/* About Section */}
                    <div>
                        <h3 style={{
                            color: 'white',
                            marginBottom: '1rem',
                            fontWeight: 700,
                            fontSize: '1.25rem',
                        }}>
                            City Hospital
                        </h3>
                        <p style={{
                            color: '#cbd5e1',
                            fontSize: '0.875rem',
                            lineHeight: 1.6,
                            marginBottom: '1.5rem',
                        }}>
                            Dedicated to providing exceptional healthcare services with a patient-first approach. Your health is our priority.
                        </p>

                        {/* Social Media Icons */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a href="#" style={socialIconStyle}>
                                <i className="fab fa-facebook"></i>
                            </a>
                            <a href="#" style={socialIconStyle}>
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#" style={socialIconStyle}>
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="#" style={socialIconStyle}>
                                <i className="fab fa-linkedin"></i>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h5 style={{ color: 'white', marginBottom: '1rem', fontWeight: 600 }}>
                            Quick Links
                        </h5>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <FooterLink to="/">Home</FooterLink>
                            <FooterLink to="/about">About Us</FooterLink>
                            <FooterLink to="/doctors">Our Doctors</FooterLink>
                            <FooterLink to="/booking/1">Book Appointment</FooterLink>
                        </ul>
                    </div>

                    {/* Departments */}
                    <div>
                        <h5 style={{ color: 'white', marginBottom: '1rem', fontWeight: 600 }}>
                            Departments
                        </h5>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ marginBottom: '0.5rem' }}>
                                <a href="#" style={footerLinkStyle}>Cardiology</a>
                            </li>
                            <li style={{ marginBottom: '0.5rem' }}>
                                <a href="#" style={footerLinkStyle}>Neurology</a>
                            </li>
                            <li style={{ marginBottom: '0.5rem' }}>
                                <a href="#" style={footerLinkStyle}>Pediatrics</a>
                            </li>
                            <li style={{ marginBottom: '0.5rem' }}>
                                <a href="#" style={footerLinkStyle}>Orthopedics</a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h5 style={{ color: 'white', marginBottom: '1rem', fontWeight: 600 }}>
                            Contact Info
                        </h5>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'start',
                                gap: '0.75rem',
                            }}>
                                <i className="fas fa-map-marker-alt" style={{ color: '#2563eb', marginTop: '0.25rem' }}></i>
                                <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                                    123 Health Ave, Medical District, City 56789
                                </span>
                            </li>
                            <li style={{
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                            }}>
                                <i className="fas fa-phone-alt" style={{ color: '#2563eb' }}></i>
                                <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                                    Emergency: 0123456789
                                </span>
                            </li>
                            <li style={{
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                            }}>
                                <i className="fas fa-envelope" style={{ color: '#2563eb' }}></i>
                                <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                                    info@cityhospital.com
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    borderTop: '1px solid #334155',
                    paddingTop: '1.5rem',
                    marginTop: '2rem',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                    }}>
                        <p style={{
                            color: '#cbd5e1',
                            fontSize: '0.875rem',
                            margin: 0,
                        }}>
                            © {new Date().getFullYear()} City Hospital. All Rights Reserved.
                        </p>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <a href="#" style={footerLinkStyle}>Privacy Policy</a>
                            <a href="#" style={footerLinkStyle}>Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, children }) => (
    <li style={{ marginBottom: '0.5rem' }}>
        <Link to={to} style={footerLinkStyle}>
            {children}
        </Link>
    </li>
);

const footerLinkStyle = {
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '0.875rem',
    transition: 'color 0.2s',
    ':hover': {
        color: 'white',
    },
};

const socialIconStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: '2px solid #334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#cbd5e1',
    textDecoration: 'none',
    transition: 'all 0.2s',
    ':hover': {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
        color: 'white',
    },
};

export default Footer;
