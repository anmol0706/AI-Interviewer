import { User } from '../models/index.js';
import { asyncHandler, ApiError, generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/index.js';
import logger from '../utils/logger.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
        throw new ApiError(409, 'User with this email already exists', 'USER_EXISTS');
    }

    // Create user
    const user = await User.create({
        email,
        password,
        firstName,
        lastName
    });

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                role: user.role,
                preferences: user.preferences,
                subscription: {
                    plan: user.subscription.plan,
                    interviewsRemaining: user.subscription.interviewsRemaining
                }
            },
            tokens: {
                accessToken,
                refreshToken
            }
        }
    });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
        throw new ApiError(401, 'Account has been deactivated', 'ACCOUNT_INACTIVE');
    }

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update user
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${email}`);

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                avatar: user.avatar,
                role: user.role,
                profile: user.profile,
                preferences: user.preferences,
                statistics: user.statistics,
                subscription: {
                    plan: user.subscription.plan,
                    interviewsRemaining: user.subscription.interviewsRemaining,
                    features: user.subscription.features
                }
            },
            tokens: {
                accessToken,
                refreshToken
            }
        }
    });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        // Clear refresh token from database
        await User.findOneAndUpdate(
            { refreshToken },
            { $unset: { refreshToken: 1 } }
        );
    }

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new ApiError(401, 'Refresh token required', 'NO_REFRESH_TOKEN');
    }

    // Verify refresh token
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
        throw new ApiError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // Find user with this refresh token
    const user = await User.findOne({
        _id: decoded.userId,
        refreshToken
    }).select('+refreshToken');

    if (!user) {
        throw new ApiError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // Generate new tokens
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
        success: true,
        data: {
            tokens: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        }
    });
});

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                avatar: user.avatar,
                role: user.role,
                profile: user.profile,
                preferences: user.preferences,
                statistics: user.statistics,
                subscription: {
                    plan: user.subscription.plan,
                    interviewsRemaining: user.subscription.interviewsRemaining,
                    features: user.subscription.features,
                    startDate: user.subscription.startDate,
                    endDate: user.subscription.endDate
                },
                emailVerified: user.emailVerified,
                createdAt: user.createdAt
            }
        }
    });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const allowedUpdates = [
        'firstName', 'lastName', 'avatar',
        'profile.title', 'profile.company', 'profile.experience',
        'profile.targetRole', 'profile.targetCompany', 'profile.skills',
        'profile.preferredInterviewTypes'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
            updates[key] = req.body[key];
        }
    });

    const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                avatar: user.avatar,
                profile: user.profile
            }
        }
    });
});

/**
 * Update user preferences
 * PUT /api/auth/preferences
 */
export const updatePreferences = asyncHandler(async (req, res) => {
    const { interviewerPersonality, difficultyLevel, voiceEnabled, emailNotifications, timezone } = req.body;

    const updates = {};
    if (interviewerPersonality) updates['preferences.interviewerPersonality'] = interviewerPersonality;
    if (difficultyLevel) updates['preferences.difficultyLevel'] = difficultyLevel;
    if (typeof voiceEnabled === 'boolean') updates['preferences.voiceEnabled'] = voiceEnabled;
    if (typeof emailNotifications === 'boolean') updates['preferences.emailNotifications'] = emailNotifications;
    if (timezone) updates['preferences.timezone'] = timezone;

    const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updates },
        { new: true }
    );

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: {
            preferences: user.preferences
        }
    });
});

/**
 * Change password
 * PUT /api/auth/password
 */
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select('+password');

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw new ApiError(401, 'Current password is incorrect', 'INVALID_PASSWORD');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});

export default {
    register,
    login,
    logout,
    refreshAccessToken,
    getCurrentUser,
    updateProfile,
    updatePreferences,
    changePassword
};
