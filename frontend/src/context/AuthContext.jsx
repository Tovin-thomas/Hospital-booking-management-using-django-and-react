import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from token on mount
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const token = localStorage.getItem('access_token');

        if (token) {
            try {
                // Decode token to get user info
                const decoded = jwtDecode(token);

                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    // Token expired, try to refresh
                    await refreshToken();
                } else {
                    // Load full user profile
                    const response = await axios.get(API_ENDPOINTS.auth.profile);
                    setUser(response.data);
                }
            } catch (error) {
                console.error('Error loading user:', error);
                logout();
            }
        }

        setLoading(false);
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post(API_ENDPOINTS.auth.login, credentials);
            const { access, refresh } = response.data;

            // Store tokens
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Load user profile
            await loadUser();

            toast.success('Login successful!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.detail || 'Login failed. Please check your credentials.';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(API_ENDPOINTS.auth.register, userData);
            toast.success(response.data.message || 'Registration successful! Please login.');
            return { success: true };
        } catch (error) {
            const errors = error.response?.data;
            let message = 'Registration failed. Please try again.';

            if (errors) {
                // Extract first error message
                const firstError = Object.values(errors)[0];
                message = Array.isArray(firstError) ? firstError[0] : firstError;
            }

            toast.error(message);
            return { success: false, error: errors };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        toast.info('Logged out successfully');
    };

    const refreshToken = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            const response = await axios.post(API_ENDPOINTS.auth.refresh, { refresh });
            const { access } = response.data;
            localStorage.setItem('access_token', access);
            await loadUser();
        } catch (error) {
            logout();
            throw error;
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put(API_ENDPOINTS.auth.profile, profileData);
            setUser(response.data);
            toast.success('Profile updated successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.detail || 'Failed to update profile';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
