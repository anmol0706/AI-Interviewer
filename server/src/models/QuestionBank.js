import mongoose from 'mongoose';

const questionBankSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['hr', 'technical', 'behavioral', 'system-design'],
        required: true,
        index: true
    },
    subCategory: {
        type: String,
        required: true,
        index: true
        // e.g., 'react', 'nodejs', 'algorithms', 'databases', 'leadership', 'conflict-resolution'
    },
    question: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['open-ended', 'technical', 'coding', 'scenario', 'design'],
        required: true
    },
    expectedAnswer: {
        summary: { type: String, default: '' },
        keyPoints: [String],
        codeExample: { type: String, default: null },
        timeComplexity: { type: String, default: null },
        spaceComplexity: { type: String, default: null }
    },
    scoringGuidelines: {
        correctnessIndicators: [String],
        reasoningIndicators: [String],
        communicationTips: [String],
        commonMistakes: [String]
    },
    followUpQuestions: [{
        condition: String, // e.g., 'if_correct', 'if_incorrect', 'always'
        question: String,
        difficulty: String
    }],
    tags: [String],
    companies: [String], // e.g., 'google', 'amazon', 'meta'
    roles: [String], // e.g., 'frontend', 'backend', 'fullstack'
    experienceLevel: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 20 }
    },
    metadata: {
        usageCount: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        successRate: { type: Number, default: 0 }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Compound indexes for efficient querying
questionBankSchema.index({ category: 1, difficulty: 1 });
questionBankSchema.index({ category: 1, subCategory: 1, difficulty: 1 });
questionBankSchema.index({ tags: 1 });
questionBankSchema.index({ companies: 1 });

// Static method to get random questions
questionBankSchema.statics.getRandomQuestions = async function (options = {}) {
    const {
        category,
        subCategory,
        difficulty,
        count = 10,
        excludeIds = [],
        companies = [],
        experienceYears = null
    } = options;

    const query = { isActive: true };

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (difficulty) query.difficulty = difficulty;
    if (excludeIds.length > 0) query._id = { $nin: excludeIds };
    if (companies.length > 0) query.companies = { $in: companies };
    if (experienceYears !== null) {
        query['experienceLevel.min'] = { $lte: experienceYears };
        query['experienceLevel.max'] = { $gte: experienceYears };
    }

    const questions = await this.aggregate([
        { $match: query },
        { $sample: { size: count } }
    ]);

    return questions;
};

// Static method to get questions by difficulty progression
questionBankSchema.statics.getProgressiveQuestions = async function (category, subCategory, startDifficulty = 'medium', count = 10) {
    const difficulties = ['easy', 'medium', 'hard', 'expert'];
    const startIndex = difficulties.indexOf(startDifficulty);

    const questions = [];
    const questionsPerDifficulty = Math.ceil(count / 4);

    for (let i = 0; i < difficulties.length && questions.length < count; i++) {
        const diffIndex = (startIndex + i) % difficulties.length;
        const difficulty = difficulties[diffIndex];

        const diffQuestions = await this.getRandomQuestions({
            category,
            subCategory,
            difficulty,
            count: questionsPerDifficulty,
            excludeIds: questions.map(q => q._id)
        });

        questions.push(...diffQuestions);
    }

    return questions.slice(0, count);
};

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);

export default QuestionBank;
