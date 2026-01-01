import dailyQuestionsService from '../services/dailyQuestionsService.js';
import { asyncHandler, ApiError } from '../middleware/index.js';
import logger from '../utils/logger.js';

/**
 * Get today's daily questions
 * GET /api/daily-practice/questions
 */
export const getDailyQuestions = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const data = await dailyQuestionsService.getQuestionsForUser(userId);

    res.json({
        success: true,
        data
    });
});

/**
 * Submit an answer for a daily question
 * POST /api/daily-practice/submit
 */
export const submitAnswer = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { category, questionIndex, selectedAnswer } = req.body;

    if (!category || questionIndex === undefined || !selectedAnswer) {
        throw new ApiError(400, 'Category, questionIndex, and selectedAnswer are required');
    }

    if (!['A', 'B', 'C', 'D'].includes(selectedAnswer)) {
        throw new ApiError(400, 'Selected answer must be A, B, C, or D');
    }

    const result = await dailyQuestionsService.submitAnswer(
        userId,
        category,
        questionIndex,
        selectedAnswer
    );

    res.json({
        success: true,
        data: result
    });
});

/**
 * Get user's daily practice statistics
 * GET /api/daily-practice/stats
 */
export const getUserStats = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const stats = await dailyQuestionsService.getUserStats(userId);

    res.json({
        success: true,
        data: stats
    });
});

/**
 * Get daily practice leaderboard
 * GET /api/daily-practice/leaderboard
 */
export const getLeaderboard = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    const leaderboard = await dailyQuestionsService.getLeaderboard(limit);

    res.json({
        success: true,
        data: leaderboard
    });
});

/**
 * Force regenerate today's questions (Admin only)
 * POST /api/daily-practice/regenerate
 */
export const regenerateQuestions = asyncHandler(async (req, res) => {
    // Note: This should be protected with admin authorization

    const DailyQuestion = (await import('../models/DailyQuestion.js')).default;
    const today = new Date().toISOString().split('T')[0];

    // Delete today's questions
    await DailyQuestion.deleteOne({ date: today });

    // Generate new questions
    const questions = await dailyQuestionsService.generateDailyQuestions();

    logger.info(`Admin regenerated daily questions for ${today}`);

    res.json({
        success: true,
        message: 'Daily questions regenerated successfully',
        data: {
            date: questions.date,
            categoryCounts: {
                communication: questions.categories.communication.length,
                aptitude: questions.categories.aptitude.length,
                generalKnowledge: questions.categories.generalKnowledge.length
            }
        }
    });
});

/**
 * Get current streak information
 * GET /api/daily-practice/streak
 */
export const getStreakInfo = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const UserDailyProgress = (await import('../models/UserDailyProgress.js')).default;

    const streakInfo = await UserDailyProgress.getStreakInfo(userId);

    res.json({
        success: true,
        data: streakInfo
    });
});

export default {
    getDailyQuestions,
    submitAnswer,
    getUserStats,
    getLeaderboard,
    regenerateQuestions,
    getStreakInfo
};
