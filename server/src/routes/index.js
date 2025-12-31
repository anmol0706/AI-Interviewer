import express from 'express';
import authRoutes from './authRoutes.js';
import interviewRoutes from './interviewRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'AI Interviewer API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/interviews', interviewRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
