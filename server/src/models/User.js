import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't return password by default
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: 50
    },
    avatar: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['user', 'premium', 'admin'],
        default: 'user'
    },
    profile: {
        title: { type: String, default: '' },
        company: { type: String, default: '' },
        experience: { type: Number, default: 0 },
        targetRole: { type: String, default: '' },
        targetCompany: { type: String, default: '' },
        skills: [{ type: String }],
        preferredInterviewTypes: [{
            type: String,
            enum: ['hr', 'technical', 'behavioral', 'system-design']
        }]
    },
    preferences: {
        interviewerPersonality: {
            type: String,
            enum: ['strict', 'friendly', 'professional'],
            default: 'professional'
        },
        difficultyLevel: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'expert'],
            default: 'medium'
        },
        voiceEnabled: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
        timezone: { type: String, default: 'UTC' }
    },
    statistics: {
        totalInterviews: { type: Number, default: 0 },
        totalQuestions: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        streakDays: { type: Number, default: 0 },
        lastInterviewDate: { type: Date, default: null },
        bestCategory: { type: String, default: null },
        weakestCategory: { type: String, default: null }
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'premium', 'enterprise'],
            default: 'free'
        },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        interviewsRemaining: { type: Number, default: 5 }, // Free tier limit
        features: [{
            type: String,
            enum: ['voice-analysis', 'detailed-analytics', 'custom-questions', 'priority-support']
        }]
    },
    refreshToken: {
        type: String,
        select: false
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    lastLogin: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to update interview statistics
userSchema.methods.updateStatistics = async function (interviewScore, category) {
    this.statistics.totalInterviews += 1;

    // Calculate new average score
    const totalScore = this.statistics.averageScore * (this.statistics.totalInterviews - 1);
    this.statistics.averageScore = (totalScore + interviewScore) / this.statistics.totalInterviews;

    this.statistics.lastInterviewDate = new Date();

    await this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ 'profile.skills': 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

export default User;
