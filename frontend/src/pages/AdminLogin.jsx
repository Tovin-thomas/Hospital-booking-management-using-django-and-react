import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    // Show any error passed via router state (e.g. 'Access denied' from ProtectedRoute)
    const [error, setError] = useState(location.state?.error || '');
    const [loading, setLoading] = useState(false);
    // Where to go after successful login (defaults to admin dashboard)
    const from = location.state?.from?.pathname || '/admin/dashboard';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData);

        if (result.success) {
            if (result.user?.is_superuser) {
                navigate(from, { replace: true });
            } else {
                setError('Access denied. This login is for administrators only. Your account does not have admin privileges.');
                setLoading(false);
            }
        } else {
            // Show the exact error from the server (wrong password, user not found, etc.)
            setError(result.error || 'Invalid credentials. Please check your username and password.');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem'
        }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔐 Admin Login</h1>
                    <p style={{ color: 'var(--color-gray-600)' }}>
                        Administrator access only
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="form-input"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                        style={{ marginTop: '1rem' }}
                    >
                        {loading ? 'Logging in...' : 'Login as Admin'}
                    </button>
                </form>

                <div style={{
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--color-gray-200)',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--color-gray-600)'
                }}>
                    <p>Not an administrator?</p>
                    <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>
                        Go to regular login →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
