import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const from = location.state?.from?.pathname || '/dashboard';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(formData);

        setLoading(false);

        if (result.success) {
            navigate(from, { replace: true });
        }
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 0',
            backgroundColor: 'var(--color-gray-50)',
        }}>
            <div className="container-sm">
                <div className="card" style={{ maxWidth: '450px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        Login to Your Account
                    </h2>

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
                                placeholder="Enter your username"
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
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-gray-600)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
