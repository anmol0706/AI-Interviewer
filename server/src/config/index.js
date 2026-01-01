import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const config = {
  // Server Configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // Database Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interviewer',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Google Cloud Configuration
  google: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    geminiApiKey: process.env.GEMINI_API_KEY,
    // Multiple API keys for fallback (comma-separated)
    geminiApiKeys: process.env.GEMINI_API_KEYS
      ? process.env.GEMINI_API_KEYS.split(',').map(key => key.trim()).filter(key => key)
      : (process.env.GEMINI_API_KEY ? [process.env.GEMINI_API_KEY] : []),
    speechApiKey: process.env.GOOGLE_SPEECH_API_KEY,
  },

  // Google Cloud Storage
  storage: {
    bucketName: process.env.GCS_BUCKET_NAME || 'ai-interviewer-audio',
    keyFile: process.env.GCS_KEY_FILE,
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'session-secret',
    maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 86400000,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 52428800, // 50MB
    path: process.env.UPLOAD_PATH || './uploads',
  },

  // Interview Configuration
  interview: {
    maxQuestionsPerSession: 20,
    defaultTimePerQuestion: 120, // seconds
    difficultyLevels: ['easy', 'medium', 'hard', 'expert'],
    interviewTypes: ['hr', 'technical', 'behavioral', 'system-design'],
    personalities: ['strict', 'friendly', 'professional'],
  },

  // Scoring Configuration
  scoring: {
    weights: {
      correctness: 0.30,
      reasoning: 0.25,
      communication: 0.20,
      confidence: 0.15,
      structure: 0.10,
    },
    thresholds: {
      excellent: 85,
      good: 70,
      average: 55,
      needsImprovement: 40,
    }
  }
};

// Validate required configuration
const requiredEnvVars = ['GEMINI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0 && config.env === 'production') {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

export default config;
