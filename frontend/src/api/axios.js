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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor — auto-refresh on 401
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops if the refresh auth endpoint itself returns 401
        // Also prevent intercepting login requests (which would cause a redirect loop / page refresh on wrong password)
        if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If a refresh is already happening, queue this request
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = 'Bearer ' + token;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = tokenStore.getRefresh();

                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // Use raw axios to bypass interceptors for the refresh call
                const response = await axios.post(`${API_URL}/auth/refresh/`, {
                    refresh: refreshToken,
                });

                const { access, refresh } = response.data;
                tokenStore.setAccess(access); // Store new access token in memory
                if (refresh) {
                    tokenStore.setRefresh(refresh); // Store rotated refresh token
                }

                originalRequest.headers.Authorization = `Bearer ${access}`;

                // Process the queued requests with the new token
                processQueue(null, access);

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                tokenStore.clearAll();

                // Only redirect if it's not a public page where we were just silently restoring session
                const isAdminRoute = window.location.pathname.startsWith('/admin');

                if (window.location.pathname !== '/' &&
                    window.location.pathname !== '/doctors' &&
                    window.location.pathname !== '/departments' &&
                    window.location.pathname !== '/about' &&
                    window.location.pathname !== '/contact') {
                    window.location.href = isAdminRoute ? '/admin-login' : '/login';
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
