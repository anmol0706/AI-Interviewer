import { User, InterviewSession } from '../models/index.js';
import { asyncHandler, ApiError } from '../middleware/index.js';
import { analyticsService } from '../services/analytics/index.js';

/**
 * Get user dashboard analytics
 * GET /api/analytics/dashboard
 */
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);

    // Get recent interviews
    const recentInterviews = await InterviewSession.find({
        user: req.userId,
        status: 'completed'
    })
        .sort({ completedAt: -1 })
        .limit(10)
        .select('sessionId interviewType overallScores difficulty completedAt');

    // Calculate overall statistics
    const allInterviews = await InterviewSession.find({
        user: req.userId,
        status: 'completed'
    }).select('interviewType overallScores difficulty responses createdAt');

    // Interview type distribution
    const typeDistribution = {};
    const scoresByType = {};
    const scoresTrend = [];

    allInterviews.forEach(interview => {
        const type = interview.interviewType;

        // Count by type
        typeDistribution[type] = (typeDistribution[type] || 0) + 1;

        // Average score by type
        if (!scoresByType[type]) {
            scoresByType[type] = { total: 0, count: 0 };
        }
        scoresByType[type].total += interview.overallScores?.overall || 0;
        scoresByType[type].count += 1;

        // Score trend (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (new Date(interview.createdAt) >= thirtyDaysAgo) {
            scoresTrend.push({
                date: interview.createdAt,
                score: interview.overallScores?.overall || 0,
                type: interview.interviewType
            });
        }
    });

    // Calculate average by type
    const averageByType = {};
    Object.entries(scoresByType).forEach(([type, data]) => {
        averageByType[type] = Math.round(data.total / data.count);
    });

    // Skill radar data
    const skillScores = {};
    const skillCounts = {};

    allInterviews.forEach(interview => {
        const scores = interview.overallScores || {};
        ['correctness', 'reasoning', 'communication', 'structure', 'confidence'].forEach(skill => {
            if (scores[skill]) {
                skillScores[skill] = (skillScores[skill] || 0) + scores[skill];
                skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            }
        });
    });

    const skillRadar = Object.entries(skillScores).map(([skill, total]) => ({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        score: Math.round(total / skillCounts[skill])
    }));

    // Calculate streaks
    const streak = await calculateStreak(req.userId);

    res.json({
        success: true,
        data: {
            overview: {
                totalInterviews: user.statistics.totalInterviews,
                totalQuestions: user.statistics.totalQuestions,
                averageScore: Math.round(user.statistics.averageScore),
                currentStreak: streak,
                lastInterviewDate: user.statistics.lastInterviewDate
            },
            subscription: {
                plan: user.subscription.plan,
                interviewsRemaining: user.subscription.interviewsRemaining
            },
            recentInterviews: recentInterviews.map(i => ({
                sessionId: i.sessionId,
                type: i.interviewType,
                score: i.overallScores?.overall || 0,
                difficulty: i.difficulty?.initial,
                date: i.completedAt
            })),
            typeDistribution,
            averagesByType: averageByType,
            scoresTrend: scoresTrend.sort((a, b) => new Date(a.date) - new Date(b.date)),
            skillRadar,
            performanceLevel: analyticsService.getPerformanceLevel(user.statistics.averageScore)
        }
    });
});

/**
 * Get detailed performance analytics
 * GET /api/analytics/performance
 */
export const getPerformanceAnalytics = asyncHandler(async (req, res) => {
    const { period = '30days' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
        case '7days':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case '30days':
            startDate.setDate(startDate.getDate() - 30);
            break;
        case '90days':
            startDate.setDate(startDate.getDate() - 90);
            break;
        case 'all':
            startDate.setFullYear(2020); // All time
            break;
        default:
            startDate.setDate(startDate.getDate() - 30);
    }

    const interviews = await InterviewSession.find({
        user: req.userId,
        status: 'completed',
        completedAt: { $gte: startDate, $lte: endDate }
    }).sort({ completedAt: 1 });

    // Aggregate performance data
    const dailyPerformance = {};
    const categoryPerformance = {};
    const difficultyPerformance = { easy: [], medium: [], hard: [], expert: [] };

    interviews.forEach(interview => {
        const dateKey = new Date(interview.completedAt).toISOString().split('T')[0];

        // Daily aggregation
        if (!dailyPerformance[dateKey]) {
            dailyPerformance[dateKey] = { total: 0, count: 0, interviews: [] };
        }
        dailyPerformance[dateKey].total += interview.overallScores?.overall || 0;
        dailyPerformance[dateKey].count += 1;
        dailyPerformance[dateKey].interviews.push({
            type: interview.interviewType,
            score: interview.overallScores?.overall || 0
        });

        // Category aggregation
        const category = interview.subCategory || interview.interviewType;
        if (!categoryPerformance[category]) {
            categoryPerformance[category] = { total: 0, count: 0, scores: [] };
        }
        categoryPerformance[category].total += interview.overallScores?.overall || 0;
        categoryPerformance[category].count += 1;
        categoryPerformance[category].scores.push(interview.overallScores?.overall || 0);

        // Difficulty aggregation
        const difficulty = interview.difficulty?.initial || 'medium';
        difficultyPerformance[difficulty].push(interview.overallScores?.overall || 0);
    });

    // Calculate averages and trends
    const dailyData = Object.entries(dailyPerformance).map(([date, data]) => ({
        date,
        averageScore: Math.round(data.total / data.count),
        interviewCount: data.count
    }));

    const categoryData = Object.entries(categoryPerformance).map(([category, data]) => ({
        category,
        averageScore: Math.round(data.total / data.count),
        interviewCount: data.count,
        trend: calculateTrend(data.scores)
    }));

    const difficultyData = Object.entries(difficultyPerformance).map(([difficulty, scores]) => ({
        difficulty,
        averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        interviewCount: scores.length
    }));

    // Calculate improvement rate
    const improvementRate = calculateImprovementRate(interviews);

    res.json({
        success: true,
        data: {
            period,
            totalInterviews: interviews.length,
            averageScore: interviews.length > 0
                ? Math.round(interviews.reduce((sum, i) => sum + (i.overallScores?.overall || 0), 0) / interviews.length)
                : 0,
            improvementRate,
            dailyPerformance: dailyData,
            categoryPerformance: categoryData.sort((a, b) => b.interviewCount - a.interviewCount),
            difficultyPerformance: difficultyData,
            bestPerformingCategory: categoryData.sort((a, b) => b.averageScore - a.averageScore)[0]?.category || null,
            needsImprovementCategory: categoryData.sort((a, b) => a.averageScore - b.averageScore)[0]?.category || null
        }
    });
});

/**
 * Get strengths and weaknesses analysis
 * GET /api/analytics/strengths-weaknesses
 */
export const getStrengthsWeaknesses = asyncHandler(async (req, res) => {
    const interviews = await InterviewSession.find({
        user: req.userId,
        status: 'completed'
    })
        .sort({ completedAt: -1 })
        .limit(20);

    const strengthCounts = {};
    const weaknessCounts = {};
    const skillScores = {
        correctness: [],
        reasoning: [],
        communication: [],
        structure: [],
        confidence: []
    };

    interviews.forEach(interview => {
        // Collect AI-identified strengths and weaknesses
        interview.responses?.forEach(response => {
            response.aiAnalysis?.strengths?.forEach(s => {
                strengthCounts[s] = (strengthCounts[s] || 0) + 1;
            });
            response.aiAnalysis?.weaknesses?.forEach(w => {
                weaknessCounts[w] = (weaknessCounts[w] || 0) + 1;
            });
        });

        // Collect skill scores
        const scores = interview.overallScores || {};
        Object.keys(skillScores).forEach(skill => {
            if (scores[skill]) {
                skillScores[skill].push(scores[skill]);
            }
        });
    });

    // Sort and limit
    const topStrengths = Object.entries(strengthCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([strength, count]) => ({ strength, frequency: count }));

    const topWeaknesses = Object.entries(weaknessCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([weakness, count]) => ({ weakness, frequency: count }));

    // Calculate average skill scores
    const skillAverages = {};
    Object.entries(skillScores).forEach(([skill, scores]) => {
        skillAverages[skill] = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;
    });

    // Identify strongest and weakest skills
    const sortedSkills = Object.entries(skillAverages).sort((a, b) => b[1] - a[1]);
    const strongestSkill = sortedSkills[0];
    const weakestSkill = sortedSkills[sortedSkills.length - 1];

    // Generate recommendations
    const recommendations = analyticsService.generatePracticeRecommendations(
        topWeaknesses.map(w => w.weakness),
        interviews[0]?.interviewType || 'technical'
    );

    res.json({
        success: true,
        data: {
            topStrengths,
            topWeaknesses,
            skillAverages,
            strongestSkill: {
                skill: strongestSkill?.[0] || null,
                score: strongestSkill?.[1] || 0
            },
            weakestSkill: {
                skill: weakestSkill?.[0] || null,
                score: weakestSkill?.[1] || 0
            },
            recommendations
        }
    });
});

/**
 * Get practice recommendations
 * GET /api/analytics/recommendations
 */
export const getRecommendations = asyncHandler(async (req, res) => {
    // Get recent performance data
    const recentInterviews = await InterviewSession.find({
        user: req.userId,
        status: 'completed'
    })
        .sort({ completedAt: -1 })
        .limit(10);

    if (recentInterviews.length === 0) {
        return res.json({
            success: true,
            data: {
                recommendations: [{
                    topic: 'Getting Started',
                    priority: 'high',
                    reason: 'Complete your first interview to get personalized recommendations',
                    suggestedQuestions: []
                }],
                focusAreas: [],
                estimatedPrepTime: '0 hours'
            }
        });
    }

    // Analyze patterns
    const weaknesses = [];
    const lowScoreCategories = {};

    recentInterviews.forEach(interview => {
        interview.responses?.forEach(response => {
            response.aiAnalysis?.weaknesses?.forEach(w => weaknesses.push(w));
        });

        // Track low-scoring categories
        const category = interview.subCategory || interview.interviewType;
        const score = interview.overallScores?.overall || 0;

        if (score < 70) {
            if (!lowScoreCategories[category]) {
                lowScoreCategories[category] = { total: 0, count: 0 };
            }
            lowScoreCategories[category].total += score;
            lowScoreCategories[category].count += 1;
        }
    });

    // Generate recommendations
    const recommendations = analyticsService.generatePracticeRecommendations(
        weaknesses,
        recentInterviews[0].interviewType
    );

    // Add category-specific recommendations
    Object.entries(lowScoreCategories).forEach(([category, data]) => {
        const avgScore = data.total / data.count;
        if (avgScore < 60) {
            recommendations.push({
                topic: `${category} Fundamentals`,
                priority: 'high',
                reason: `Your average score in ${category} is ${Math.round(avgScore)}%`,
                suggestedQuestions: analyticsService.getTechnicalPracticeQuestions(category)
            });
        }
    });

    // Calculate estimated prep time
    const totalPriority = recommendations.reduce((sum, r) => {
        return sum + (r.priority === 'high' ? 3 : r.priority === 'medium' ? 2 : 1);
    }, 0);
    const estimatedHours = Math.ceil(totalPriority * 2);

    res.json({
        success: true,
        data: {
            recommendations: recommendations.slice(0, 5),
            focusAreas: [...new Set(weaknesses)].slice(0, 3),
            estimatedPrepTime: `${estimatedHours} hours`
        }
    });
});

/**
 * Helper: Calculate user streak
 */
async function calculateStreak(userId) {
    const interviews = await InterviewSession.find({
        user: userId,
        status: 'completed'
    })
        .sort({ completedAt: -1 })
        .select('completedAt')
        .limit(60);

    if (interviews.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const interviewDates = new Set(
        interviews.map(i => new Date(i.completedAt).toISOString().split('T')[0])
    );

    for (let i = 0; i < 60; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (interviewDates.has(dateStr)) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    return streak;
}

/**
 * Helper: Calculate trend from scores
 */
function calculateTrend(scores) {
    if (scores.length < 2) return 'stable';

    const mid = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, mid);
    const secondHalf = scores.slice(mid);

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 10) return 'improving';
    if (diff < -10) return 'declining';
    return 'stable';
}

/**
 * Helper: Calculate improvement rate
 */
function calculateImprovementRate(interviews) {
    if (interviews.length < 2) return 0;

    const firstThird = interviews.slice(0, Math.ceil(interviews.length / 3));
    const lastThird = interviews.slice(-Math.ceil(interviews.length / 3));

    const firstAvg = firstThird.reduce((sum, i) => sum + (i.overallScores?.overall || 0), 0) / firstThird.length;
    const lastAvg = lastThird.reduce((sum, i) => sum + (i.overallScores?.overall || 0), 0) / lastThird.length;

    return Math.round(((lastAvg - firstAvg) / Math.max(firstAvg, 1)) * 100);
}

export default {
    getDashboardAnalytics,
    getPerformanceAnalytics,
    getStrengthsWeaknesses,
    getRecommendations
};
