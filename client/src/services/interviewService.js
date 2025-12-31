import api from './api';

export const interviewService = {
    // Start a new interview
    startInterview: async (config) => {
        const response = await api.post('/interviews/start', config);
        return response.data;
    },

    // Submit answer
    submitAnswer: async (sessionId, answer, audioData = null) => {
        const response = await api.post(`/interviews/${sessionId}/answer`, {
            answer,
            audioData
        });
        return response.data;
    },

    // Get session status
    getSession: async (sessionId) => {
        const response = await api.get(`/interviews/${sessionId}`);
        return response.data;
    },

    // End interview
    endInterview: async (sessionId) => {
        const response = await api.post(`/interviews/${sessionId}/end`);
        return response.data;
    },

    // Get interview history
    getHistory: async (params = {}) => {
        const response = await api.get('/interviews', { params });
        return response.data;
    },

    // Get interview report
    getReport: async (sessionId) => {
        const response = await api.get(`/interviews/${sessionId}/report`);
        return response.data;
    }
};

export const analyticsService = {
    // Get dashboard analytics
    getDashboard: async () => {
        const response = await api.get('/analytics/dashboard');
        return response.data;
    },

    // Get detailed performance
    getPerformance: async (period = '30days') => {
        const response = await api.get('/analytics/performance', {
            params: { period }
        });
        return response.data;
    },

    // Get strengths and weaknesses
    getStrengthsWeaknesses: async () => {
        const response = await api.get('/analytics/strengths-weaknesses');
        return response.data;
    },

    // Get recommendations
    getRecommendations: async () => {
        const response = await api.get('/analytics/recommendations');
        return response.data;
    }
};

export default { interviewService, analyticsService };
