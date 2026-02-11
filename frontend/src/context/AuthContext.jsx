import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Initialize user from localStorage to prevent race conditions
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is not expired - RELAXED for clock skew
                // if (decoded.exp * 1000 > Date.now()) {
                // Return a temporary user object to maintain auth state
                // Full profile will be loaded in useEffect
                return { id: decoded.user_id, isTemporary: true };
                // }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
        return null;
    });
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
                // const decoded = jwtDecode(token);

                // RELAXED CHECK: We rely on the API to return 401 if token is expired.
                // This handles cases where client clock (e.g. 2026) is far ahead of server (2025),
                // which would otherwise cause an infinite refresh loop.

                // if (decoded.exp * 1000 < Date.now()) {
                //     // Token expired, try to refresh
                //     await refreshToken();
                // } else {
                // Load full user profile
                const response = await axios.get(API_ENDPOINTS.auth.profile);
                setUser(response.data);
                // }
            } catch (error) {
                console.error('Error loading user:', error);
                // Only logout if it's strictly an auth error (handled by interceptor usually, but here for safety)
                // If the error was 401, the interceptor would have tried to refresh already.
                // If it failed after refresh, we might need to logout.
                if (error.response?.status === 401) {
                    // Interceptor handles retry, if it bubbles up here it means refresh failed
                    logout();
                }
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

            // Fetch user profile directly and return it
            const profileResponse = await axios.get(API_ENDPOINTS.auth.profile);
            const userData = profileResponse.data;
            setUser(userData);

            toast.success('Login successful!');
            return { success: true, user: userData }; // Return the actual user data
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

    const googleLogin = async (token) => {
        try {
            const response = await axios.post(API_ENDPOINTS.auth.google, { token });
            const { access, refresh, user } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // If backend returns user, set it. Otherwise load it.
            if (user) {
                setUser(user);
            } else {
                await loadUser();
            }

            toast.success('Login successful!');
            return { success: true, user: user || await loadUser() };
        } catch (error) {
            const message = error.response?.data?.error || 'Google Login failed';
            toast.error(message);
            return { success: false, error: message };
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
        googleLogin,
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
