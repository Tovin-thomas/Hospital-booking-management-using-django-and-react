import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ============================================================
// SECURE TOKEN STORAGE
// Access token → memory only (JS variable, never written to disk)
//   → Cannot be stolen by XSS after page close
// Refresh token → sessionStorage (cleared when browser/tab closes)
//   → Safer than localStorage which persists indefinitely
// ============================================================
let _accessToken = null;

export const tokenStore = {
    // Access token — memory only
    getAccess: () => _accessToken,
    setAccess: (token) => { _accessToken = token; },
    clearAccess: () => { _accessToken = null; },

    // Refresh token — sessionStorage (survives page refresh, not browser close)
    getRefresh: () => sessionStorage.getItem('refresh_token'),
    setRefresh: (token) => sessionStorage.setItem('refresh_token', token),
    clearRefresh: () => sessionStorage.removeItem('refresh_token'),

    // Clear everything (logout)
    clearAll: () => {
        _accessToken = null;
        sessionStorage.removeItem('refresh_token');
        // Also clear old localStorage tokens if any exist (migration)
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },
};

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach access token from memory
axiosInstance.interceptors.request.use(
    (config) => {
        const token = tokenStore.getAccess();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — auto-refresh on 401
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = tokenStore.getRefresh();

                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_URL}/auth/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                tokenStore.setAccess(access); // Store new access token in memory

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                tokenStore.clearAll();
                // Redirect to the correct login page based on the route that failed
                const isAdminRoute = originalRequest.url?.includes('/admin') ||
                    window.location.pathname.startsWith('/admin');
                window.location.href = isAdminRoute ? '/admin-login' : '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
