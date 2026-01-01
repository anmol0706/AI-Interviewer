import geminiService from './ai/geminiService.js';
import DailyQuestion from '../models/DailyQuestion.js';
import UserDailyProgress from '../models/UserDailyProgress.js';
import logger from '../utils/logger.js';

class DailyQuestionsService {
    constructor() {
        this.questionsPerCategory = 5; // 5 questions per category
        this.categories = ['communication', 'aptitude', 'generalKnowledge'];
        // Map for normalizing category names
        this.categoryMapping = {
            'communication': 'communication',
            'aptitude': 'aptitude',
            'generalknowledge': 'generalKnowledge',
            'generalKnowledge': 'generalKnowledge',
            'general knowledge': 'generalKnowledge',
            'general-knowledge': 'generalKnowledge'
        };
    }

    /**
     * Normalize category name to database key
     */
    normalizeCategoryKey(category) {
        const normalized = this.categoryMapping[category] || this.categoryMapping[category.toLowerCase()];
        if (!normalized) {
            throw new Error(`Invalid category: ${category}`);
        }
        return normalized;
    }

    /**
     * Generate questions for a specific category using Gemini AI
     */
    async generateCategoryQuestions(category) {
        const categoryPrompts = {
            communication: `Generate 5 multiple-choice questions to test Communication Skills.
Focus on:
- Verbal and written communication
- Active listening
- Professional email etiquette
- Presentation skills
- Interpersonal communication
- Body language and non-verbal cues
- Conflict resolution through communication`,

            aptitude: `Generate 5 multiple-choice questions to test Aptitude.
Focus on:
- Logical reasoning
- Quantitative aptitude (basic math, percentages, ratios)
- Data interpretation
- Pattern recognition
- Problem-solving
- Critical thinking
- Analytical skills`,

            generalKnowledge: `Generate 5 multiple-choice questions to test General Knowledge.
Focus on:
- Current affairs and recent events
- Technology and innovation
- Business and economy
- Science and environment
- Geography and culture
- History and politics
- Sports and entertainment`
        };

        const prompt = `${categoryPrompts[category]}

IMPORTANT: Generate exactly 5 questions with varying difficulty (2 easy, 2 medium, 1 hard).

Respond in this exact JSON format:
{
    "questions": [
        {
            "questionText": "Clear, well-formatted question text",
            "options": [
                { "id": "A", "text": "First option" },
                { "id": "B", "text": "Second option" },
                { "id": "C", "text": "Third option" },
                { "id": "D", "text": "Fourth option" }
            ],
            "correctAnswer": "A",
            "explanation": "Brief explanation of why this answer is correct",
            "difficulty": "easy|medium|hard"
        }
    ]
}

Rules:
1. Each question must have exactly 4 options (A, B, C, D)
2. Questions should be clear, unambiguous, and educational
3. Explanations should be informative and help users learn
4. Mix of difficulty levels across questions
5. Questions should be relevant and up-to-date
6. Avoid controversial or sensitive topics`;

        try {
            const response = await geminiService.ai.models.generateContent({
                model: geminiService.modelName,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });

            const parsed = geminiService.parseAIResponse(response.text);

            if (parsed.questions && Array.isArray(parsed.questions)) {
                return parsed.questions.map(q => ({
                    questionText: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    difficulty: q.difficulty || 'medium'
                }));
            }

            throw new Error('Invalid question format received from AI');
        } catch (error) {
            logger.error(`Error generating ${category} questions:`, error);
            throw error;
        }
    }

    /**
     * Generate all daily questions for today
     */
    async generateDailyQuestions() {
        const today = new Date().toISOString().split('T')[0];

        // Check if questions already exist for today
        const existing = await DailyQuestion.findOne({ date: today });
        if (existing) {
            logger.info(`Daily questions already exist for ${today}`);
            return existing;
        }

        logger.info(`Generating daily questions for ${today}`);

        try {
            // Generate questions for all categories in parallel
            const [communication, aptitude, generalKnowledge] = await Promise.all([
                this.generateCategoryQuestions('communication'),
                this.generateCategoryQuestions('aptitude'),
                this.generateCategoryQuestions('generalKnowledge')
            ]);

            const dailyQuestion = await DailyQuestion.create({
                date: today,
                categories: {
                    communication,
                    aptitude,
                    generalKnowledge
                },
                generatedAt: new Date(),
                isActive: true
            });

            logger.info(`✅ Daily questions generated successfully for ${today}`);
            return dailyQuestion;
        } catch (error) {
            logger.error('Failed to generate daily questions:', error);
            throw error;
        }
    }

    /**
     * Get today's questions (generate if not exist)
     */
    async getTodaysQuestions() {
        let questions = await DailyQuestion.getTodaysQuestions();

        if (!questions) {
            questions = await this.generateDailyQuestions();
        }

        return questions;
    }

    /**
     * Get questions for user (without revealing correct answers)
     */
    async getQuestionsForUser(userId) {
        const questions = await this.getTodaysQuestions();
        const progress = await UserDailyProgress.getOrCreateTodaysProgress(userId);
        const streakInfo = await UserDailyProgress.getStreakInfo(userId);

        // Remove correct answers for unanswered questions
        const sanitizedCategories = {};

        for (const [category, categoryQuestions] of Object.entries(questions.categories)) {
            const userResponses = progress.progress[category]?.responses || [];

            sanitizedCategories[category] = categoryQuestions.map((q, index) => {
                const userResponse = userResponses.find(r => r.questionIndex === index);

                return {
                    questionText: q.questionText,
                    options: q.options,
                    difficulty: q.difficulty,
                    answered: !!userResponse,
                    userAnswer: userResponse?.selectedAnswer || null,
                    isCorrect: userResponse?.isCorrect || null,
                    // Only reveal correct answer and explanation if already answered
                    correctAnswer: userResponse ? q.correctAnswer : undefined,
                    explanation: userResponse ? q.explanation : undefined
                };
            });
        }

        return {
            date: questions.date,
            categories: sanitizedCategories,
            progress: {
                communication: progress.progress.communication,
                aptitude: progress.progress.aptitude,
                generalKnowledge: progress.progress.generalKnowledge
            },
            isCompleted: progress.isCompleted,
            completedAt: progress.completedAt,
            totalScore: progress.totalScore,
            maxScore: progress.maxScore,
            streak: streakInfo.currentStreak,
            streakActive: streakInfo.streakActive
        };
    }

    /**
     * Submit an answer for a question
     */
    async submitAnswer(userId, category, questionIndex, selectedAnswer) {
        const questions = await this.getTodaysQuestions();

        // Normalize category key
        let categoryKey;
        try {
            categoryKey = this.normalizeCategoryKey(category);
        } catch (e) {
            throw new Error('Invalid category');
        }

        // Validate category exists in questions
        if (!questions.categories[categoryKey]) {
            throw new Error('Invalid category');
        }

        // Validate question index
        const categoryQuestions = questions.categories[categoryKey];
        if (questionIndex < 0 || questionIndex >= categoryQuestions.length) {
            throw new Error('Invalid question index');
        }

        const question = categoryQuestions[questionIndex];
        const isCorrect = question.correctAnswer === selectedAnswer;

        // Update progress
        const progress = await UserDailyProgress.getOrCreateTodaysProgress(userId);
        await progress.answerQuestion(categoryKey, questionIndex, selectedAnswer, isCorrect);

        // Calculate total questions
        const totalQuestions =
            questions.categories.communication.length +
            questions.categories.aptitude.length +
            questions.categories.generalKnowledge.length;

        // Check if all questions are completed (may grant rewards)
        const completionResult = await progress.checkCompletion(totalQuestions);

        return {
            isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            progress: progress.progress[categoryKey],
            isCompleted: completionResult.isCompleted,
            streak: completionResult.streak || progress.streak,
            totalScore: progress.totalScore,
            maxScore: progress.maxScore,
            // Reward info
            rewardGranted: completionResult.rewardGranted || false,
            rewardType: completionResult.rewardType || null
        };
    }

    /**
     * Reset daily progress for all users (called at midnight)
     */
    async resetDailyProgress() {
        const today = new Date().toISOString().split('T')[0];
        logger.info(`Starting daily reset for ${today}`);

        try {
            // Mark previous day's questions as inactive (optional, for archiving)
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            await DailyQuestion.updateMany(
                { date: yesterdayStr },
                { isActive: false }
            );

            // Generate new questions for today
            await this.generateDailyQuestions();

            logger.info('✅ Daily reset completed successfully');
        } catch (error) {
            logger.error('Daily reset failed:', error);
            throw error;
        }
    }

    /**
     * Get leaderboard data
     */
    async getLeaderboard(limit = 10) {
        const today = new Date().toISOString().split('T')[0];

        const leaderboard = await UserDailyProgress.aggregate([
            { $match: { date: today, isCompleted: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    firstName: '$user.firstName',
                    lastName: '$user.lastName',
                    avatar: '$user.avatar',
                    totalScore: 1,
                    maxScore: 1,
                    streak: 1,
                    completedAt: 1,
                    percentage: {
                        $multiply: [
                            { $divide: ['$totalScore', '$maxScore'] },
                            100
                        ]
                    }
                }
            },
            { $sort: { totalScore: -1, completedAt: 1 } },
            { $limit: limit }
        ]);

        return leaderboard;
    }

    /**
     * Get user statistics for daily practice
     */
    async getUserStats(userId) {
        const allProgress = await UserDailyProgress.find({ userId })
            .sort({ date: -1 })
            .limit(30); // Last 30 days

        const stats = {
            totalDaysAttempted: allProgress.length,
            totalDaysCompleted: allProgress.filter(p => p.isCompleted).length,
            currentStreak: 0,
            longestStreak: 0,
            averageScore: 0,
            categoryPerformance: {
                communication: { total: 0, correct: 0 },
                aptitude: { total: 0, correct: 0 },
                generalKnowledge: { total: 0, correct: 0 }
            },
            recentHistory: allProgress.slice(0, 7).map(p => ({
                date: p.date,
                isCompleted: p.isCompleted,
                totalScore: p.totalScore,
                maxScore: p.maxScore,
                streak: p.streak
            }))
        };

        // Calculate averages and totals
        let totalScore = 0;
        let maxScore = 0;

        allProgress.forEach(p => {
            totalScore += p.totalScore;
            maxScore += p.maxScore;

            for (const category of ['communication', 'aptitude', 'generalKnowledge']) {
                stats.categoryPerformance[category].total += p.progress[category]?.answered || 0;
                stats.categoryPerformance[category].correct += p.progress[category]?.correct || 0;
            }

            if (p.streak > stats.longestStreak) {
                stats.longestStreak = p.streak;
            }
        });

        if (maxScore > 0) {
            stats.averageScore = Math.round((totalScore / maxScore) * 100);
        }

        // Get current streak
        const streakInfo = await UserDailyProgress.getStreakInfo(userId);
        stats.currentStreak = streakInfo.currentStreak;

        return stats;
    }
}

const dailyQuestionsService = new DailyQuestionsService();

export default dailyQuestionsService;
