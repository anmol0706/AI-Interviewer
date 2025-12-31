import express from 'express';
import { body, query, param } from 'express-validator';
import { interviewController } from '../controllers/index.js';
import { authenticate, checkSubscription } from '../middleware/index.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/interviews/start
 * @desc    Start a new interview session
 * @access  Private
 */
router.post('/start', checkSubscription, [
    body('interviewType')
        .isIn(['hr', 'technical', 'behavioral', 'system-design'])
        .withMessage('Invalid interview type'),
    body('subCategory')
        .optional()
        .isString(),
    body('personality')
        .optional()
        .isIn(['strict', 'friendly', 'professional']),
    body('targetCompany')
        .optional()
        .isString()
        .trim(),
    body('targetRole')
        .optional()
        .isString()
        .trim(),
    body('difficulty')
        .optional()
        .isIn(['easy', 'medium', 'hard', 'expert']),
    body('voiceEnabled')
        .optional()
        .isBoolean(),
    body('totalQuestions')
        .optional()
        .isInt({ min: 5, max: 30 })
], interviewController.startInterview);

/**
 * @route   POST /api/interviews/:sessionId/answer
 * @desc    Submit answer for current question
 * @access  Private
 */
router.post('/:sessionId/answer', [
    param('sessionId')
        .notEmpty()
        .withMessage('Session ID is required'),
    body('answer')
        .optional()
        .isString(),
    body('audioData')
        .optional()
        .isString()
], interviewController.submitAnswer);

/**
 * @route   GET /api/interviews/:sessionId
 * @desc    Get interview session status
 * @access  Private
 */
router.get('/:sessionId', [
    param('sessionId')
        .notEmpty()
], interviewController.getSessionStatus);

/**
 * @route   POST /api/interviews/:sessionId/end
 * @desc    End interview early
 * @access  Private
 */
router.post('/:sessionId/end', [
    param('sessionId')
        .notEmpty()
], interviewController.endInterview);

/**
 * @route   GET /api/interviews/history
 * @desc    Get user's interview history
 * @access  Private
 */
router.get('/', [
    query('page')
        .optional()
        .isInt({ min: 1 }),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 }),
    query('type')
        .optional()
        .isIn(['hr', 'technical', 'behavioral', 'system-design']),
    query('status')
        .optional()
        .isIn(['completed', 'in-progress', 'abandoned'])
], interviewController.getInterviewHistory);

/**
 * @route   GET /api/interviews/:sessionId/report
 * @desc    Get full interview report
 * @access  Private
 */
router.get('/:sessionId/report', [
    param('sessionId')
        .notEmpty()
], interviewController.getInterviewReport);

export default router;
