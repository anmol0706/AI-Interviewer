import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import models
import User from '../models/User.js';
import QuestionBank from '../models/QuestionBank.js';

const sampleQuestions = [
    // Technical - Algorithms
    {
        category: 'technical',
        subCategory: 'algorithms',
        question: 'Explain the difference between BFS and DFS. When would you use one over the other?',
        difficulty: 'medium',
        type: 'technical',
        expectedAnswer: {
            summary: 'BFS explores level by level, DFS goes deep first',
            keyPoints: ['BFS uses queue', 'DFS uses stack/recursion', 'BFS for shortest path', 'DFS for cycle detection']
        },
        tags: ['algorithms', 'graphs', 'data-structures'],
        companies: ['google', 'amazon', 'meta'],
        roles: ['fullstack', 'backend']
    },
    {
        category: 'technical',
        subCategory: 'algorithms',
        question: 'What is the time complexity of quicksort? What is the worst case scenario?',
        difficulty: 'medium',
        type: 'technical',
        expectedAnswer: {
            summary: 'Average O(n log n), worst O(n²) with already sorted array',
            keyPoints: ['Average case O(n log n)', 'Worst case O(n²)', 'Pivot selection matters', 'In-place sorting']
        },
        tags: ['sorting', 'algorithms', 'complexity'],
        companies: ['google', 'microsoft'],
        roles: ['fullstack', 'backend']
    },
    // Behavioral
    {
        category: 'behavioral',
        subCategory: 'leadership',
        question: 'Tell me about a time when you had to lead a project under tight deadlines.',
        difficulty: 'medium',
        type: 'scenario',
        expectedAnswer: {
            summary: 'STAR method response about leadership',
            keyPoints: ['Situation clarity', 'Clear task definition', 'Specific actions', 'Measurable results']
        },
        tags: ['leadership', 'time-management'],
        companies: ['amazon'],
        roles: ['fullstack', 'backend', 'frontend']
    },
    // System Design
    {
        category: 'system-design',
        subCategory: 'scalability',
        question: 'How would you design a URL shortening service like bit.ly?',
        difficulty: 'hard',
        type: 'design',
        expectedAnswer: {
            summary: 'Distributed system with key generation service',
            keyPoints: ['Hash function', 'Database sharding', 'Caching layer', 'Analytics tracking']
        },
        tags: ['system-design', 'scalability', 'databases'],
        companies: ['google', 'meta', 'amazon'],
        roles: ['backend', 'fullstack']
    },
    // HR
    {
        category: 'hr',
        subCategory: 'motivation',
        question: 'Why are you interested in this role and our company?',
        difficulty: 'easy',
        type: 'open-ended',
        expectedAnswer: {
            summary: 'Clear motivation aligned with company mission',
            keyPoints: ['Research about company', 'Role alignment', 'Career goals', 'Value proposition']
        },
        tags: ['motivation', 'company-fit'],
        companies: [],
        roles: ['fullstack', 'backend', 'frontend']
    }
];

async function seed() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interviewer';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing data
        await QuestionBank.deleteMany({});
        console.log('Cleared question bank');

        // Insert sample questions
        await QuestionBank.insertMany(sampleQuestions);
        console.log(`Inserted ${sampleQuestions.length} sample questions`);

        // Create demo user
        const existingUser = await User.findOne({ email: 'demo@example.com' });
        if (!existingUser) {
            await User.create({
                email: 'demo@example.com',
                password: 'Demo123!',
                firstName: 'Demo',
                lastName: 'User',
                role: 'user',
                subscription: { plan: 'premium', interviewsRemaining: 999 }
            });
            console.log('Created demo user: demo@example.com / Demo123!');
        }

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}

seed();
