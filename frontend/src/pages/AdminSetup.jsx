import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/endpoints';

const AdminSetup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        setup_token: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/setup-admin/`, {
                setup_token: formData.setup_token,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name
            });

            setSuccess(response.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create admin account');
        } finally {
            setLoading(false);
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
                <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        🔐 Admin Setup
                    </h2>
                    <p style={{ textAlign: 'center', color: 'var(--color-gray-600)', marginBottom: '2rem' }}>
                        One-time setup for the first administrator account
                    </p>

                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                            {success} Redirecting to login...
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Setup Token *</label>
                            <input
                                type="password"
                                name="setup_token"
                                className="form-input"
                                value={formData.setup_token}
                                onChange={handleChange}
                                required
                                placeholder="Enter the secret setup token"
                            />
                            <small style={{ color: 'var(--color-gray-600)' }}>
                                This token is set in the server environment variables
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Username *</label>
                            <input
                                type="text"
                                name="username"
                                className="form-input"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    className="form-input"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    className="form-input"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password *</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="8"
                            />
                            <small style={{ color: 'var(--color-gray-600)' }}>
                                Minimum 8 characters
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-input"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                        <p>⚠️ This page only works once</p>
                        <p>After the first admin is created, this page will be disabled</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSetup;
