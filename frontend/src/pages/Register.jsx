import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        phone_number: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password2) {
            alert('Passwords do not match!');
            return;
        }

        setLoading(true);
        const result = await registerUser(formData);
        setLoading(false);

        if (result.success) {
            navigate('/login');
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
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        Create an Account
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="grid" style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                        }}>
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    className="form-input"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="First name"
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
                                    required
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                name="username"
                                className="form-input"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Choose a username"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                name="phone_number"
                                className="form-input"
                                value={formData.phone_number}
                                onChange={handleChange}
                                pattern="[0-9]{10}"
                                placeholder="10 digit phone number"
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
                                minLength={8}
                                placeholder="At least 8 characters"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="password2"
                                className="form-input"
                                value={formData.password2}
                                onChange={handleChange}
                                required
                                placeholder="Re-enter password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-gray-600)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
