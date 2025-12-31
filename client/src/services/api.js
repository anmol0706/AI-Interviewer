import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const { accessToken } = useAuthStore.getState();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If unauthorized and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const { refreshToken, updateTokens, logout } = useAuthStore.getState();

            if (refreshToken) {
                try {
                    const response = await axios.post(
                        `${api.defaults.baseURL}/auth/refresh`,
                        { refreshToken }
                    );

                    const { tokens } = response.data.data;
                    updateTokens(tokens);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, logout
                    logout();
                    return Promise.reject(refreshError);
                }
            } else {
                logout();
            }
        }

        return Promise.reject(error);
    }
);

export default api;
