import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: [{
        id: { type: String, required: true },
        text: { type: String, required: true }
    }],
    correctAnswer: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    }
});

const dailyQuestionSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    categories: {
        communication: [questionSchema],
        aptitude: [questionSchema],
        generalKnowledge: [questionSchema]
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient date-based queries
dailyQuestionSchema.index({ date: 1, isActive: 1 });

// Static method to get today's questions (server time)
dailyQuestionSchema.statics.getTodaysQuestions = async function () {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return this.findOne({ date: today, isActive: true });
};

// Static method to check if questions exist for today
dailyQuestionSchema.statics.questionsExistForToday = async function () {
    const today = new Date().toISOString().split('T')[0];
    return this.exists({ date: today, isActive: true });
};

const DailyQuestion = mongoose.model('DailyQuestion', dailyQuestionSchema);

export default DailyQuestion;
