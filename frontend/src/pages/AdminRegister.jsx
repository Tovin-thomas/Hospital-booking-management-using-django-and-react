import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

const AdminRegister = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ reason: '' });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.reason.trim()) {
            toast.error('Please provide a reason for your request.');
            return;
        }
        setLoading(true);
        try {
            await axios.post(API_ENDPOINTS.adminRequests.submit, { reason: formData.reason });
            setSubmitted(true);
            toast.success('Request submitted! The main admin will review it.');
        } catch (error) {
            const msg = error.response?.data?.error || 'Failed to submit request.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1.5rem',
                padding: '3rem',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '1rem',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '1rem'
                    }}>
                        <i className="fas fa-shield-alt" style={{ fontSize: '1.75rem', color: 'white' }} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                        Request Admin Access
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
                        Submit a request to become an administrator.<br />
                        The main admin (<strong>admintovin</strong>) will review and approve it.
                    </p>
                </div>

                {submitted ? (
                    /* Success state */
                    <div style={{
                        textAlign: 'center', padding: '2rem',
                        backgroundColor: '#f0fdf4', borderRadius: '1rem',
                        border: '2px solid #86efac'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h3 style={{ color: '#15803d', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Request Submitted!
                        </h3>
                        <p style={{ color: '#166534', marginBottom: '1.5rem' }}>
                            Your request has been sent to <strong>admintovin</strong> for approval.
                            You'll be granted admin access once approved.
                        </p>
                        <Link to="/" style={{
                            padding: '0.75rem 2rem', backgroundColor: '#15803d',
                            color: 'white', borderRadius: '0.75rem', textDecoration: 'none',
                            fontWeight: 600, display: 'inline-block'
                        }}>
                            Go to Homepage
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Must be logged in */}
                        {!user && (
                            <div style={{
                                padding: '1rem', backgroundColor: '#fef3c7',
                                borderRadius: '0.75rem', marginBottom: '1.5rem',
                                border: '1px solid #fcd34d', color: '#92400e'
                            }}>
                                <i className="fas fa-exclamation-triangle" style={{ marginRight: '0.5rem' }} />
                                You must be <Link to="/login" style={{ color: '#92400e', fontWeight: 700 }}>logged in</Link> to submit a request.
                            </div>
                        )}

                        {/* Username display */}
                        {user && (
                            <div style={{
                                padding: '1rem', backgroundColor: '#f1f5f9',
                                borderRadius: '0.75rem', marginBottom: '1.5rem',
                                display: 'flex', alignItems: 'center', gap: '0.75rem'
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: 700, fontSize: '1.125rem', flexShrink: 0
                                }}>
                                    {user.username?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{user.username}</div>
                                    <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{user.email}</div>
                                </div>
                            </div>
                        )}

                        {/* Reason */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block', marginBottom: '0.5rem',
                                fontWeight: 600, color: '#374151', fontSize: '0.9375rem'
                            }}>
                                Why do you need admin access? *
                            </label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                rows={4}
                                placeholder="Explain why you should be granted admin access (e.g., role, responsibilities)..."
                                required
                                style={{
                                    width: '100%', padding: '0.875rem 1rem',
                                    border: '2px solid #e2e8f0', borderRadius: '0.75rem',
                                    fontSize: '0.9375rem', color: '#1e293b', resize: 'vertical',
                                    outline: 'none', boxSizing: 'border-box',
                                    fontFamily: 'inherit', transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !user}
                            style={{
                                width: '100%', padding: '1rem',
                                background: loading || !user
                                    ? '#94a3b8'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white', border: 'none', borderRadius: '0.75rem',
                                fontSize: '1rem', fontWeight: 700, cursor: loading || !user ? 'not-allowed' : 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            {loading
                                ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }} />Submitting...</>
                                : <><i className="fas fa-paper-plane" style={{ marginRight: '0.5rem' }} />Submit Request</>
                            }
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <Link to="/admin-login" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>
                                ← Already have admin access? Log in
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminRegister;
