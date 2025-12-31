import express from 'express';
import { query } from 'express-validator';
import { analyticsController } from '../controllers/index.js';
import { authenticate } from '../middleware/index.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get user dashboard analytics
 * @access  Private
 */
router.get('/dashboard', analyticsController.getDashboardAnalytics);

/**
 * @route   GET /api/analytics/performance
 * @desc    Get detailed performance analytics
 * @access  Private
 */
router.get('/performance', [
    query('period')
        .optional()
        .isIn(['7days', '30days', '90days', 'all'])
], analyticsController.getPerformanceAnalytics);

/**
 * @route   GET /api/analytics/strengths-weaknesses
 * @desc    Get strengths and weaknesses analysis
 * @access  Private
 */
router.get('/strengths-weaknesses', analyticsController.getStrengthsWeaknesses);

/**
 * @route   GET /api/analytics/recommendations
 * @desc    Get practice recommendations
 * @access  Private
 */
router.get('/recommendations', analyticsController.getRecommendations);

export default router;
