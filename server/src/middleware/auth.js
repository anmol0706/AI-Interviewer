import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);

        // Find user
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated.'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user._id;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired.',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        logger.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

/**
 * Middleware for optional authentication (user info if available)
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.findById(decoded.userId).select('-password');

        if (user && user.isActive) {
            req.user = user;
            req.userId = user._id;
        }

        next();
    } catch (error) {
        // Continue without authentication on any error
        next();
    }
};

/**
 * Middleware to check user roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

/**
 * Middleware to check subscription limits
 */
export const checkSubscription = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        const { subscription } = req.user;

        // Check if subscription is active for paid plans
        if (subscription.plan !== 'free' && subscription.endDate) {
            if (new Date(subscription.endDate) < new Date()) {
                return res.status(403).json({
                    success: false,
                    message: 'Your subscription has expired. Please renew to continue.',
                    code: 'SUBSCRIPTION_EXPIRED'
                });
            }
        }

        // Check interview limits for free tier
        if (subscription.plan === 'free' && subscription.interviewsRemaining <= 0) {
            return res.status(403).json({
                success: false,
                message: 'You have reached your free interview limit. Please upgrade to continue.',
                code: 'LIMIT_REACHED'
            });
        }

        next();
    } catch (error) {
        logger.error('Subscription check error:', error);
        next(error);
    }
};

/**
 * Generate JWT token
 */
export const generateToken = (userId, expiresIn = config.jwt.expiresIn) => {
    return jwt.sign(
        { userId, type: 'access' },
        config.jwt.secret,
        { expiresIn }
    );
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
    );
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, config.jwt.refreshSecret);
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        return decoded;
    } catch (error) {
        throw error;
    }
};

export default {
    authenticate,
    optionalAuth,
    authorize,
    checkSubscription,
    generateToken,
    generateRefreshToken,
    verifyRefreshToken
};
