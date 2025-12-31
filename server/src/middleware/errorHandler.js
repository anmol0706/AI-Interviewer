import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(statusCode, message, code = null, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Async handler wrapper to catch errors
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * 404 Not Found handler
 */
export const notFound = (req, res, next) => {
    const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
    next(error);
};

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let code = err.code || 'INTERNAL_ERROR';
    let details = err.details || null;

    // Log the error
    if (statusCode >= 500) {
        logger.error('Server Error:', {
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method
        });
    } else {
        logger.warn('Client Error:', {
            message: err.message,
            statusCode,
            path: req.path
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        message = 'Validation failed';
        details = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        code = 'DUPLICATE_ERROR';
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
    }

    // Mongoose cast error (invalid ID)
    if (err.name === 'CastError') {
        statusCode = 400;
        code = 'INVALID_ID';
        message = 'Invalid ID format';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        code = 'INVALID_TOKEN';
        message = 'Invalid authentication token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Authentication token has expired';
    }

    // Build response
    const response = {
        success: false,
        message,
        code
    };

    if (details) {
        response.details = details;
    }

    // Include stack trace in development
    if (config.env === 'development' && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

/**
 * Request validation error handler
 */
export const validationErrorHandler = (errors) => {
    if (!errors.isEmpty()) {
        const error = new ApiError(400, 'Validation failed', 'VALIDATION_ERROR');
        error.details = errors.array().map(e => ({
            field: e.path,
            message: e.msg,
            value: e.value
        }));
        return error;
    }
    return null;
};

export default {
    ApiError,
    asyncHandler,
    notFound,
    errorHandler,
    validationErrorHandler
};
