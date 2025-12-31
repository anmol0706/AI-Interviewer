import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: true,

            // Initialize auth state
            initialize: async () => {
                const { accessToken, refreshToken } = get();

                if (!accessToken) {
                    set({ isLoading: false });
                    return;
                }

                try {
                    // Validate token by fetching current user
                    const response = await api.get('/auth/me');
                    set({
                        user: response.data.data.user,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } catch (error) {
                    // Try to refresh token
                    if (refreshToken) {
                        try {
                            const refreshResponse = await api.post('/auth/refresh', { refreshToken });
                            const { tokens } = refreshResponse.data.data;

                            set({
                                accessToken: tokens.accessToken,
                                refreshToken: tokens.refreshToken
                            });

                            // Retry fetching user
                            const userResponse = await api.get('/auth/me');
                            set({
                                user: userResponse.data.data.user,
                                isAuthenticated: true,
                                isLoading: false
                            });
                        } catch (refreshError) {
                            get().logout();
                        }
                    } else {
                        get().logout();
                    }
                }
            },

            // Login
            login: async (email, password) => {
                const response = await api.post('/auth/login', { email, password });
                const { user, tokens } = response.data.data;

                set({
                    user,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    isAuthenticated: true,
                    isLoading: false
                });

                return user;
            },

            // Register
            register: async (userData) => {
                const response = await api.post('/auth/register', userData);
                const { user, tokens } = response.data.data;

                set({
                    user,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    isAuthenticated: true,
                    isLoading: false
                });

                return user;
            },

            // Logout
            logout: async () => {
                const { refreshToken } = get();

                try {
                    if (refreshToken) {
                        await api.post('/auth/logout', { refreshToken });
                    }
                } catch (error) {
                    // Ignore logout errors
                }

                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false
                });
            },

            // Update user
            updateUser: (userData) => {
                set((state) => ({
                    user: { ...state.user, ...userData }
                }));
            },

            // Update tokens
            updateTokens: (tokens) => {
                set({
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken
                });
            },

            // Update preferences
            updatePreferences: async (preferences) => {
                const response = await api.put('/auth/preferences', preferences);
                set((state) => ({
                    user: { ...state.user, preferences: response.data.data.preferences }
                }));
            },

            // Update profile
            updateProfile: async (profileData) => {
                const response = await api.put('/auth/profile', profileData);
                set((state) => ({
                    user: { ...state.user, ...response.data.data.user }
                }));
            }
        }),
        {
            name: 'ai-interviewer-auth',
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken
            })
        }
    )
);

// Initialize on load
if (typeof window !== 'undefined') {
    useAuthStore.getState().initialize();
}

export default useAuthStore;
