import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
    getDailyQuestions,
    submitAnswer,
    getUserStats,
    getLeaderboard,
    regenerateQuestions,
    getStreakInfo
} from '../controllers/dailyPracticeController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get today's daily practice questions
router.get('/questions', getDailyQuestions);

// Submit an answer
router.post('/submit', submitAnswer);

// Get user's statistics
router.get('/stats', getUserStats);

// Get streak information
router.get('/streak', getStreakInfo);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

// Regenerate questions (Admin only)
router.post('/regenerate', authorize('admin'), regenerateQuestions);

export default router;
