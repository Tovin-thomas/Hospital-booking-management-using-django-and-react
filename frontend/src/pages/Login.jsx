import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, googleLogin, logout } = useAuth();
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const from = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleLoginSuccess = (user) => {
        // Enforce Patient-Only Access
        const isSuperUser = user?.is_superuser;
        const isDoctor = user?.role === 'doctor' || (user?.is_staff && !user?.is_superuser);

        if (isSuperUser) {
            toast.error('This page is for Patients only. Admins must use /admin-login.');
            logout(); // Log them out immediately
            return;
        }

        if (isDoctor) {
            toast.error('This page is for Patients only. Doctors must use the Doctor Portal.');
            logout(); // Log them out immediately
            return;
        }

        // If regular patient, proceed
        let redirectPath = '/';
        if (from !== '/' && from !== '/login' && from !== '/register') {
            redirectPath = from;
        }
        navigate(redirectPath, { replace: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        const result = await login(formData);
        console.log('Login Result:', result); // Debug

        setFormLoading(false);

        if (result.success) {
            handleLoginSuccess(result.user);
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
                            disabled={formLoading}
                        >
                            {formLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                const result = await googleLogin(credentialResponse.credential);
                                if (result.success) {
                                    handleLoginSuccess(result.user);
                                }
                            }}
                            onError={() => {
                                console.log('Login Failed');
                                toast.error('Google Login Failed');
                            }}
                            useOneTap
                        />
                    </div>

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
