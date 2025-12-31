import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

class Database {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    async connect() {
        if (this.isConnected) {
            logger.info('Using existing database connection');
            return this.connection;
        }

        try {
            // Set mongoose configuration
            mongoose.set('strictQuery', true);

            // Connect to MongoDB
            this.connection = await mongoose.connect(config.mongodb.uri, config.mongodb.options);

            this.isConnected = true;
            logger.info(`✅ MongoDB connected: ${this.connection.connection.host}`);

            // Handle connection events
            mongoose.connection.on('error', (err) => {
                logger.error('MongoDB connection error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB disconnected. Attempting to reconnect...');
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                logger.info('MongoDB reconnected');
                this.isConnected = true;
            });

            // Graceful shutdown
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });

            return this.connection;
        } catch (error) {
            logger.error('❌ MongoDB connection failed:', error.message);
            throw error;
        }
    }

    async disconnect() {
        if (!this.isConnected) {
            return;
        }

        try {
            await mongoose.disconnect();
            this.isConnected = false;
            logger.info('MongoDB disconnected successfully');
        } catch (error) {
            logger.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name,
        };
    }
}

// Singleton instance
const database = new Database();

export default database;
