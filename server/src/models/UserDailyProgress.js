import mongoose from 'mongoose';

const categoryProgressSchema = new mongoose.Schema({
    answered: {
        type: Number,
        default: 0
    },
    correct: {
        type: Number,
        default: 0
    },
    responses: [{
        questionIndex: Number,
        selectedAnswer: String,
        isCorrect: Boolean,
        answeredAt: { type: Date, default: Date.now }
    }]
});

const userDailyProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: String,
        required: true,
        index: true
    },
    progress: {
        communication: {
            type: categoryProgressSchema,
            default: () => ({})
        },
        aptitude: {
            type: categoryProgressSchema,
            default: () => ({})
        },
        generalKnowledge: {
            type: categoryProgressSchema,
            default: () => ({})
        }
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    totalScore: {
        type: Number,
        default: 0
    },
    maxScore: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    streakUpdated: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for user + date queries
userDailyProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

// Static method to get or create today's progress for a user
userDailyProgressSchema.statics.getOrCreateTodaysProgress = async function (userId) {
    const today = new Date().toISOString().split('T')[0];

    let progress = await this.findOne({ userId, date: today });

    if (!progress) {
        // Get yesterday's date to check streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Check if user completed yesterday's questions
        const yesterdayProgress = await this.findOne({
            userId,
            date: yesterdayStr,
            isCompleted: true
        });

        // Calculate current streak
        let currentStreak = 0;
        if (yesterdayProgress) {
            currentStreak = yesterdayProgress.streak;
        }

        progress = await this.create({
            userId,
            date: today,
            streak: currentStreak // Keep streak from yesterday (will increment when completed)
        });
    }

    return progress;
};

// Method to mark category question as answered
userDailyProgressSchema.methods.answerQuestion = async function (category, questionIndex, selectedAnswer, isCorrect) {
    // Category key should already be normalized by the caller (e.g., 'generalKnowledge')
    const categoryKey = category;

    // Validate category exists
    if (!this.progress[categoryKey]) {
        throw new Error(`Invalid category: ${category}`);
    }

    // Check if already answered
    const existingResponse = this.progress[categoryKey].responses.find(
        r => r.questionIndex === questionIndex
    );

    if (existingResponse) {
        throw new Error('Question already answered');
    }

    this.progress[categoryKey].responses.push({
        questionIndex,
        selectedAnswer,
        isCorrect,
        answeredAt: new Date()
    });

    this.progress[categoryKey].answered += 1;
    if (isCorrect) {
        this.progress[categoryKey].correct += 1;
        this.totalScore += 1;
    }
    this.maxScore += 1;

    await this.save();
    return this;
};

// Method to check if all questions are completed and handle rewards
userDailyProgressSchema.methods.checkCompletion = async function (totalQuestions) {
    const totalAnswered =
        this.progress.communication.answered +
        this.progress.aptitude.answered +
        this.progress.generalKnowledge.answered;

    let rewardGranted = false;
    let newStreak = this.streak;

    if (totalAnswered >= totalQuestions && !this.isCompleted) {
        this.isCompleted = true;
        this.completedAt = new Date();

        // Update streak only once
        if (!this.streakUpdated) {
            this.streak += 1;
            newStreak = this.streak;
            this.streakUpdated = true;

            // Check if user hit a 10-day milestone (10, 20, 30, etc.)
            if (this.streak > 0 && this.streak % 10 === 0) {
                // Grant +1 interview reward
                const User = (await import('./User.js')).default;
                const user = await User.findById(this.userId);

                if (user) {
                    user.subscription.interviewsRemaining += 1;
                    await user.save();
                    rewardGranted = true;

                    // Log the reward
                    const logger = (await import('../utils/logger.js')).default;
                    logger.info(`🎁 User ${this.userId} reached ${this.streak}-day streak! Granted +1 interview.`);
                }
            }
        }

        await this.save();
    }

    return {
        isCompleted: this.isCompleted,
        streak: newStreak,
        rewardGranted,
        rewardType: rewardGranted ? 'interview' : null
    };
};

// Static method to get user's streak history
userDailyProgressSchema.statics.getStreakInfo = async function (userId) {
    const today = new Date().toISOString().split('T')[0];
    const todayProgress = await this.findOne({ userId, date: today });

    // Get the most recent completed progress
    const lastCompleted = await this.findOne({
        userId,
        isCompleted: true
    }).sort({ date: -1 });

    // Calculate if streak is still valid (user hasn't missed a day)
    let currentStreak = 0;
    let streakActive = true;

    if (lastCompleted) {
        const lastDate = new Date(lastCompleted.date);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Completed today
            currentStreak = lastCompleted.streak;
        } else if (diffDays === 1) {
            // Completed yesterday, streak continues if they complete today
            currentStreak = lastCompleted.streak;
        } else {
            // Missed a day, streak resets
            currentStreak = 0;
            streakActive = false;
        }
    }

    return {
        currentStreak,
        streakActive,
        completedToday: todayProgress?.isCompleted || false,
        todayProgress: todayProgress || null
    };
};

const UserDailyProgress = mongoose.model('UserDailyProgress', userDailyProgressSchema);

export default UserDailyProgress;
