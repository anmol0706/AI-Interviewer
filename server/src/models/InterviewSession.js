import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        enum: ['open-ended', 'technical', 'coding', 'scenario', 'follow-up'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
        required: true
    },
    timeAllowed: {
        type: Number, // in seconds
        default: 120
    },
    expectedTopics: [String], // Key topics expected in the answer
    scoringCriteria: {
        correctness: { weight: Number, maxPoints: Number },
        reasoning: { weight: Number, maxPoints: Number },
        communication: { weight: Number, maxPoints: Number },
        structure: { weight: Number, maxPoints: Number }
    }
});

const responseSchema = new mongoose.Schema({
    questionIndex: {
        type: Number,
        required: true
    },
    question: questionSchema,
    answer: {
        text: { type: String, default: '' },
        audioUrl: { type: String, default: null },
        duration: { type: Number, default: 0 } // in seconds
    },
    voiceAnalysis: {
        transcription: { type: String, default: '' },
        confidence: { type: Number, default: 0 },
        hesitationCount: { type: Number, default: 0 },
        fillerWords: [{
            word: String,
            count: Number,
            timestamps: [Number]
        }],
        pauseDurations: [{
            startTime: Number,
            endTime: Number,
            duration: Number
        }],
        averagePauseDuration: { type: Number, default: 0 },
        wordsPerMinute: { type: Number, default: 0 },
        clarityScore: { type: Number, default: 0 }
    },
    scores: {
        correctness: {
            score: { type: Number, default: 0 },
            maxScore: { type: Number, default: 100 },
            feedback: { type: String, default: '' }
        },
        reasoning: {
            score: { type: Number, default: 0 },
            maxScore: { type: Number, default: 100 },
            feedback: { type: String, default: '' }
        },
        communication: {
            score: { type: Number, default: 0 },
            maxScore: { type: Number, default: 100 },
            feedback: { type: String, default: '' }
        },
        structure: {
            score: { type: Number, default: 0 },
            maxScore: { type: Number, default: 100 },
            feedback: { type: String, default: '' }
        },
        confidence: {
            score: { type: Number, default: 0 },
            maxScore: { type: Number, default: 100 },
            feedback: { type: String, default: '' }
        },
        overall: { type: Number, default: 0 }
    },
    aiAnalysis: {
        strengths: [String],
        weaknesses: [String],
        suggestions: [String],
        keyTopicsCovered: [String],
        keyTopicsMissed: [String]
    },
    followUpQuestion: {
        generated: { type: Boolean, default: false },
        question: { type: String, default: null }
    },
    startedAt: Date,
    completedAt: Date
});

const interviewSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    interviewType: {
        type: String,
        enum: ['hr', 'technical', 'behavioral', 'system-design'],
        required: true
    },
    subCategory: {
        type: String,
        default: null // e.g., 'react', 'nodejs', 'algorithms' for technical
    },
    personality: {
        type: String,
        enum: ['strict', 'friendly', 'professional'],
        default: 'professional'
    },
    targetCompany: {
        type: String,
        default: null
    },
    targetRole: {
        type: String,
        default: null
    },
    difficulty: {
        initial: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'expert'],
            default: 'medium'
        },
        current: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'expert'],
            default: 'medium'
        },
        adjustmentHistory: [{
            fromLevel: String,
            toLevel: String,
            reason: String,
            questionIndex: Number,
            timestamp: Date
        }]
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'paused', 'completed', 'abandoned'],
        default: 'scheduled'
    },
    voiceEnabled: {
        type: Boolean,
        default: false
    },
    responses: [responseSchema],
    totalQuestions: {
        type: Number,
        default: 0
    },
    questionsAnswered: {
        type: Number,
        default: 0
    },
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    overallScores: {
        correctness: { type: Number, default: 0 },
        reasoning: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        structure: { type: Number, default: 0 },
        confidence: { type: Number, default: 0 },
        overall: { type: Number, default: 0 }
    },
    analytics: {
        totalDuration: { type: Number, default: 0 }, // in seconds
        averageResponseTime: { type: Number, default: 0 },
        difficultyProgression: [{
            questionIndex: Number,
            difficulty: String,
            score: Number
        }],
        strengthAreas: [String],
        weaknessAreas: [String],
        improvementPlan: {
            summary: { type: String, default: '' },
            focusAreas: [String],
            recommendedPractice: [{
                topic: String,
                priority: String,
                suggestedQuestions: [String]
            }],
            resources: [{
                title: String,
                url: String,
                type: String
            }]
        },
        performanceTrend: {
            type: String,
            enum: ['improving', 'stable', 'declining', 'not-enough-data'],
            default: 'not-enough-data'
        }
    },
    transcript: {
        full: { type: String, default: '' },
        highlights: [{
            timestamp: Number,
            type: String,
            content: String
        }]
    },
    metadata: {
        userAgent: String,
        ipAddress: String,
        timezone: String
    },
    scheduledAt: Date,
    startedAt: Date,
    pausedAt: Date,
    completedAt: Date,
    lastActivityAt: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for session duration
interviewSessionSchema.virtual('duration').get(function () {
    if (!this.startedAt) return 0;
    const endTime = this.completedAt || new Date();
    return Math.floor((endTime - this.startedAt) / 1000);
});

// Virtual for completion percentage
interviewSessionSchema.virtual('completionPercentage').get(function () {
    if (this.totalQuestions === 0) return 0;
    return Math.round((this.questionsAnswered / this.totalQuestions) * 100);
});

// Method to calculate overall scores
interviewSessionSchema.methods.calculateOverallScores = function () {
    if (this.responses.length === 0) return;

    const totals = {
        correctness: 0,
        reasoning: 0,
        communication: 0,
        structure: 0,
        confidence: 0
    };

    this.responses.forEach(response => {
        totals.correctness += response.scores.correctness?.score || 0;
        totals.reasoning += response.scores.reasoning?.score || 0;
        totals.communication += response.scores.communication?.score || 0;
        totals.structure += response.scores.structure?.score || 0;
        totals.confidence += response.scores.confidence?.score || 0;
    });

    const count = this.responses.length;

    this.overallScores = {
        correctness: Math.round(totals.correctness / count),
        reasoning: Math.round(totals.reasoning / count),
        communication: Math.round(totals.communication / count),
        structure: Math.round(totals.structure / count),
        confidence: Math.round(totals.confidence / count),
        overall: Math.round(
            (totals.correctness + totals.reasoning + totals.communication +
                totals.structure + totals.confidence) / (count * 5)
        )
    };
};

// Method to adjust difficulty
interviewSessionSchema.methods.adjustDifficulty = function (reason) {
    const levels = ['easy', 'medium', 'hard', 'expert'];
    const currentIndex = levels.indexOf(this.difficulty.current);

    let newIndex = currentIndex;

    if (reason === 'increase' && currentIndex < levels.length - 1) {
        newIndex = currentIndex + 1;
    } else if (reason === 'decrease' && currentIndex > 0) {
        newIndex = currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
        this.difficulty.adjustmentHistory.push({
            fromLevel: this.difficulty.current,
            toLevel: levels[newIndex],
            reason,
            questionIndex: this.currentQuestionIndex,
            timestamp: new Date()
        });
        this.difficulty.current = levels[newIndex];
    }

    return this.difficulty.current;
};

// Indexes for efficient queries
interviewSessionSchema.index({ user: 1, createdAt: -1 });
interviewSessionSchema.index({ status: 1 });
interviewSessionSchema.index({ interviewType: 1 });
interviewSessionSchema.index({ 'overallScores.overall': -1 });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;
