import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios, { tokenStore } from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Check if a refresh token exists in sessionStorage to restore session on page refresh
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount — if a refresh token exists in sessionStorage, restore the session
    useEffect(() => {
        const refreshToken = tokenStore.getRefresh();
        if (refreshToken) {
            restoreSession(refreshToken);
        } else {
            setLoading(false);
        }
    }, []);

    // Restore session using refresh token (called on page refresh/mount)
    const restoreSession = async (refreshToken) => {
        try {
            const response = await axios.post(API_ENDPOINTS.auth.refresh, {
                refresh: refreshToken,
            });
            const { access } = response.data;
            tokenStore.setAccess(access); // Put new access token back into memory

            // Load user profile with the new access token
            const profileResponse = await axios.get(API_ENDPOINTS.auth.profile);
            setUser(profileResponse.data);
        } catch (error) {
            // Refresh token expired or invalid — force logout
            tokenStore.clearAll();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post(API_ENDPOINTS.auth.login, credentials);
            const { access, refresh } = response.data;

            // Store securely — access in memory, refresh in sessionStorage
            tokenStore.setAccess(access);
            tokenStore.setRefresh(refresh);

            // Load user profile
            const profileResponse = await axios.get(API_ENDPOINTS.auth.profile);
            const userData = profileResponse.data;
            setUser(userData);

            toast.success('Login successful!');
            return { success: true, user: userData };
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
            const { access, refresh, user: googleUser } = response.data;

            tokenStore.setAccess(access);
            tokenStore.setRefresh(refresh);

            if (googleUser) {
                setUser(googleUser);
            } else {
                const profileResponse = await axios.get(API_ENDPOINTS.auth.profile);
                setUser(profileResponse.data);
            }

            toast.success('Login successful!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Google Login failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const logout = () => {
        tokenStore.clearAll(); // Clears memory + sessionStorage + old localStorage
        setUser(null);
        toast.info('Logged out successfully');
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
