import { create } from 'zustand';
import api from '../services/api';

export const useDailyPracticeStore = create((set, get) => ({
    // State
    questions: null,
    progress: null,
    isCompleted: false,
    streak: 0,
    streakActive: true,
    stats: null,
    leaderboard: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    currentCategory: 'communication',
    currentQuestionIndex: 0,

    // Actions
    setCurrentCategory: (category) => {
        set({ currentCategory: category, currentQuestionIndex: 0 });
    },

    setCurrentQuestionIndex: (index) => {
        set({ currentQuestionIndex: index });
    },

    // Fetch daily questions
    fetchDailyQuestions: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/daily-practice/questions');
            const data = response.data.data;

            set({
                questions: data.categories,
                progress: data.progress,
                isCompleted: data.isCompleted,
                streak: data.streak,
                streakActive: data.streakActive,
                isLoading: false
            });

            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch daily questions',
                isLoading: false
            });
            throw error;
        }
    },

    // Submit an answer
    submitAnswer: async (category, questionIndex, selectedAnswer) => {
        set({ isSubmitting: true, error: null });
        try {
            const response = await api.post('/daily-practice/submit', {
                category,
                questionIndex,
                selectedAnswer
            });

            const result = response.data.data;

            // Update local state with the result
            set((state) => {
                const categoryKey = category.toLowerCase().replace(/\s+/g, '');
                const updatedQuestions = { ...state.questions };

                if (updatedQuestions[categoryKey]) {
                    updatedQuestions[categoryKey] = updatedQuestions[categoryKey].map((q, idx) => {
                        if (idx === questionIndex) {
                            return {
                                ...q,
                                answered: true,
                                userAnswer: selectedAnswer,
                                isCorrect: result.isCorrect,
                                correctAnswer: result.correctAnswer,
                                explanation: result.explanation
                            };
                        }
                        return q;
                    });
                }

                return {
                    questions: updatedQuestions,
                    progress: {
                        ...state.progress,
                        [categoryKey]: result.progress
                    },
                    isCompleted: result.isCompleted,
                    streak: result.streak,
                    isSubmitting: false
                };
            });

            return result;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to submit answer',
                isSubmitting: false
            });
            throw error;
        }
    },

    // Fetch user statistics
    fetchStats: async () => {
        try {
            const response = await api.get('/daily-practice/stats');
            set({ stats: response.data.data });
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            throw error;
        }
    },

    // Fetch leaderboard
    fetchLeaderboard: async (limit = 10) => {
        try {
            const response = await api.get(`/daily-practice/leaderboard?limit=${limit}`);
            set({ leaderboard: response.data.data });
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            throw error;
        }
    },

    // Fetch streak info
    fetchStreakInfo: async () => {
        try {
            const response = await api.get('/daily-practice/streak');
            const data = response.data.data;
            set({
                streak: data.currentStreak,
                streakActive: data.streakActive,
                isCompleted: data.completedToday
            });
            return data;
        } catch (error) {
            console.error('Failed to fetch streak info:', error);
            throw error;
        }
    },

    // Get progress for a specific category
    getCategoryProgress: (category) => {
        const state = get();
        const categoryKey = category.toLowerCase().replace(/\s+/g, '');
        return state.progress?.[categoryKey] || { answered: 0, correct: 0, responses: [] };
    },

    // Get overall progress
    getOverallProgress: () => {
        const state = get();
        if (!state.questions) return { answered: 0, total: 0, correct: 0 };

        let answered = 0;
        let total = 0;
        let correct = 0;

        for (const category of Object.values(state.questions)) {
            if (Array.isArray(category)) {
                category.forEach(q => {
                    total++;
                    if (q.answered) {
                        answered++;
                        if (q.isCorrect) correct++;
                    }
                });
            }
        }

        return { answered, total, correct };
    },

    // Reset state
    reset: () => {
        set({
            questions: null,
            progress: null,
            isCompleted: false,
            error: null,
            currentCategory: 'communication',
            currentQuestionIndex: 0
        });
    }
}));

export default useDailyPracticeStore;
