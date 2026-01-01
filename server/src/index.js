import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import database from './config/database.js';
import logger from './utils/logger.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/index.js';
import { initializeSocket } from './websocket/index.js';
import dailyScheduler from './services/dailyScheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new SocketIO(server, {
    cors: {
        origin: config.clientUrl,
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Initialize WebSocket handlers
initializeSocket(io);

// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Disable for development
}));

// CORS configuration
app.use(cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// HTTP request logging
if (config.env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', { stream: logger.stream }));
}

// Static files (for uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
async function startServer() {
    try {
        // Connect to database
        await database.connect();

        // Create logs directory if it doesn't exist
        const fs = await import('fs');
        const logsDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        // Start Daily Practice scheduler
        dailyScheduler.start();

        // Start listening
        server.listen(config.port, () => {
            logger.info(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎯 AI INTERVIEWER SERVER                                    ║
║                                                               ║
║   Environment:  ${config.env.padEnd(44)}║
║   Port:         ${String(config.port).padEnd(44)}║
║   Client URL:   ${config.clientUrl.padEnd(44)}║
║                                                               ║
║   API:          http://localhost:${config.port}/api${' '.repeat(24)}║
║   Health:       http://localhost:${config.port}/api/health${' '.repeat(17)}║
║   WebSocket:    ws://localhost:${config.port}${' '.repeat(28)}║
║   Daily Practice: Scheduler running                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
      `);
        });

        // Graceful shutdown
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

async function gracefulShutdown() {
    logger.info('Received shutdown signal. Closing server gracefully...');

    // Stop daily scheduler
    dailyScheduler.stop();

    server.close(async () => {
        logger.info('HTTP server closed');

        await database.disconnect();
        logger.info('Database disconnected');

        process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
        logger.error('Could not close connections in time, forcing shutdown');
        process.exit(1);
    }, 10000);
}

// Start the server
startServer();

export { app, server, io };
