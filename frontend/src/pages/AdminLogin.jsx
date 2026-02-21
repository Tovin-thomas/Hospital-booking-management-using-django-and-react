import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Maps raw server/client errors to friendly messages ────────────────────────
const getErrorInfo = (rawError, isNotAdmin = false) => {
    if (isNotAdmin) {
        return {
            icon: '🚫',
            title: 'Not an Administrator',
            message: 'Your account exists but does not have admin privileges. Please use the regular patient login instead.',
            type: 'not-admin',
        };
    }

    if (!rawError) return null;

    const err = rawError.toLowerCase();

    if (err.includes('no active account') || err.includes('user not found') || err.includes('no account')) {
        return {
            icon: '👤',
            title: 'Account Not Found',
            message: `No admin account found with the username "${rawError.match(/username/i) ? '' : ''}you entered. Please double-check your username.`,
            type: 'not-found',
        };
    }

    if (err.includes('password') || err.includes('invalid credentials') || err.includes('wrong')) {
        return {
            icon: '🔑',
            title: 'Wrong Password',
            message: 'The password you entered is incorrect. Please try again.',
            type: 'wrong-password',
        };
    }

    if (err.includes('inactive') || err.includes('disabled') || err.includes('locked')) {
        return {
            icon: '🔒',
            title: 'Account Disabled',
            message: 'This account has been deactivated. Please contact the system administrator.',
            type: 'inactive',
        };
    }

    if (err.includes('network') || err.includes('timeout') || err.includes('connect')) {
        return {
            icon: '📡',
            title: 'Connection Error',
            message: 'Cannot reach the server. Please ensure the backend is running and try again.',
            type: 'network',
        };
    }

    // Generic / simplejwt "No active account found with the given credentials"
    return {
        icon: '❌',
        title: 'Login Failed',
        message: rawError || 'Invalid username or password. Please check your credentials and try again.',
        type: 'generic',
    };
};

// ── Color map per error type ────────────────────────────────────────────────────
const ERROR_COLORS = {
    'not-admin': { bg: '#fef3c7', border: '#fcd34d', icon: '#d97706', text: '#92400e' },
    'not-found': { bg: '#ffe4e6', border: '#fca5a5', icon: '#dc2626', text: '#991b1b' },
    'wrong-password': { bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626', text: '#991b1b' },
    'inactive': { bg: '#f3f4f6', border: '#d1d5db', icon: '#6b7280', text: '#374151' },
    'network': { bg: '#fff7ed', border: '#fed7aa', icon: '#ea580c', text: '#9a3412' },
    'generic': { bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626', text: '#991b1b' },
};

const AdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, logout, user, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errorInfo, setErrorInfo] = useState(
        location.state?.error ? getErrorInfo(location.state.error) : null
    );
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [shake, setShake] = useState(false);

    const from = location.state?.from?.pathname || '/admin/dashboard';

    // ── Auto-clear stale session on every page load ────────────────────────────
    // Runs ONCE when the component mounts (empty deps []).
    // Silently wipes any leftover tokens so the admin never gets trapped in a
    // redirect loop due to an old/expired session — no manual action needed.
    useEffect(() => {
        sessionStorage.removeItem('refresh_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        logout(); // also clears the in-memory access token
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 600);
    };

    const handleChange = (e) => {
        setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
        setErrorInfo(null); // Clear error as user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorInfo(null);

        // Session was already cleared on mount — proceed straight to fresh login

        const result = await login(formData);

        if (result.success) {
            if (result.user?.is_superuser) {
                // ✅ Valid admin — go to dashboard
                navigate(from, { replace: true });
            } else {
                // ✅ Credentials correct but NOT an admin
                logout();
                setErrorInfo(getErrorInfo(null, true));
                triggerShake();
                setLoading(false);
            }
        } else {
            // ❌ Login failed — parse the error
            setErrorInfo(getErrorInfo(result.error));
            triggerShake();
            setLoading(false);
        }
    };

    const colors = errorInfo ? (ERROR_COLORS[errorInfo.type] || ERROR_COLORS.generic) : null;

    return (
        <>
            <style>{`
                @keyframes adminFadeIn {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    15%      { transform: translateX(-8px); }
                    30%      { transform: translateX(8px); }
                    45%      { transform: translateX(-6px); }
                    60%      { transform: translateX(6px); }
                    75%      { transform: translateX(-3px); }
                    90%      { transform: translateX(3px); }
                }
                @keyframes errorSlideIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .admin-card {
                    animation: adminFadeIn 0.5s cubic-bezier(.4,0,.2,1) both;
                }
                .admin-card.shake {
                    animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
                }
                .admin-input {
                    transition: border-color 0.2s, box-shadow 0.2s;
                    background: rgba(255,255,255,0.08);
                    border: 1.5px solid rgba(255,255,255,0.15);
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: white;
                    font-size: 0.9375rem;
                    width: 100%;
                    outline: none;
                    box-sizing: border-box;
                }
                .admin-input::placeholder { color: rgba(255,255,255,0.35); }
                .admin-input:focus {
                    border-color: rgba(255,255,255,0.5);
                    box-shadow: 0 0 0 3px rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.12);
                }
                .admin-input.has-error {
                    border-color: #fca5a5;
                    box-shadow: 0 0 0 3px rgba(252,165,165,0.15);
                }
                .admin-submit-btn {
                    transition: all 0.25s ease;
                    width: 100%;
                    padding: 0.875rem;
                    border: none;
                    border-radius: 0.875rem;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                .admin-submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px -4px rgba(0,0,0,0.3);
                }
                .admin-submit-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                }
                .show-pw-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: rgba(255,255,255,0.5);
                    padding: 0 0.5rem;
                    transition: color 0.2s;
                    font-size: 0.9rem;
                    position: absolute;
                    right: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                }
                .show-pw-btn:hover { color: rgba(255,255,255,0.9); }
                .error-box {
                    animation: errorSlideIn 0.3s ease both;
                    border-radius: 0.875rem;
                    padding: 1rem 1.125rem;
                    display: flex;
                    gap: 0.875rem;
                    align-items: flex-start;
                    margin-bottom: 1.25rem;
                }
            `}</style>

            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)', pointerEvents: 'none' }} />

                <div className={`admin-card${shake ? ' shake' : ''}`} style={{
                    maxWidth: '440px',
                    width: '100%',
                    background: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '1.5rem',
                    padding: '2.5rem 2rem',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '1rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem',
                            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                        }}>
                            <i className="fas fa-shield-alt" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                        </div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
                            Admin Portal
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: 0 }}>
                            Authorised personnel only
                        </p>
                    </div>

                    {/* Error Box */}
                    {errorInfo && colors && (
                        <div className="error-box" style={{ backgroundColor: colors.bg, border: `1.5px solid ${colors.border}` }}>
                            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{errorInfo.icon}</span>
                            <div>
                                <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '0.875rem', color: colors.text }}>
                                    {errorInfo.title}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: colors.text, opacity: 0.85, lineHeight: 1.4 }}>
                                    {errorInfo.message}
                                </p>
                                {/* Contextual help links */}
                                {errorInfo.type === 'not-admin' && (
                                    <Link to="/login" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.775rem', color: colors.icon, fontWeight: 700, textDecoration: 'none' }}>
                                        Go to Patient Login →
                                    </Link>
                                )}
                                {errorInfo.type === 'not-found' && (
                                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: colors.text, opacity: 0.7 }}>
                                        💡 Tip: Usernames are case-sensitive.
                                    </p>
                                )}
                                {errorInfo.type === 'wrong-password' && (
                                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: colors.text, opacity: 0.7 }}>
                                        💡 Tip: Check Caps Lock and try again.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div style={{ marginBottom: '1.125rem' }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.4rem' }}>
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                className={`admin-input${errorInfo ? ' has-error' : ''}`}
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                required
                                autoFocus
                                autoComplete="username"
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.4rem' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className={`admin-input${errorInfo?.type === 'wrong-password' ? ' has-error' : ''}`}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                    style={{ paddingRight: '2.75rem' }}
                                />
                                <button
                                    type="button"
                                    className="show-pw-btn"
                                    onClick={() => setShowPassword(p => !p)}
                                    tabIndex={-1}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="admin-submit-btn"
                            disabled={loading}
                            style={{
                                background: loading
                                    ? 'rgba(139,92,246,0.5)'
                                    : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                color: 'white',
                                boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
                            }}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Verifying credentials…
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-unlock-alt"></i>
                                    Sign in as Admin
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div style={{
                        marginTop: '1.75rem',
                        paddingTop: '1.25rem',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        textAlign: 'center',
                    }}>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem', margin: '0 0 0.4rem' }}>
                            Not an administrator?
                        </p>
                        <Link to="/login" style={{
                            color: 'rgba(167,139,250,0.9)',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            transition: 'color 0.2s',
                        }}>
                            Go to patient login →
                        </Link>


                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;
