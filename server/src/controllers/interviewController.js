import { v4 as uuidv4 } from 'uuid';
import { InterviewSession, User, QuestionBank } from '../models/index.js';
import { asyncHandler, ApiError } from '../middleware/index.js';
import { geminiService } from '../services/ai/index.js';
import { speechService } from '../services/speech/index.js';
import { analyticsService } from '../services/analytics/index.js';
import logger from '../utils/logger.js';

/**
 * Start a new interview session
 * POST /api/interviews/start
 */
export const startInterview = asyncHandler(async (req, res) => {
    const {
        interviewType,
        subCategory,
        personality,
        targetCompany,
        targetRole,
        difficulty,
        voiceEnabled,
        totalQuestions
    } = req.body;

    const user = await User.findById(req.userId);

    // Check subscription limits
    if (user.subscription.plan === 'free' && user.subscription.interviewsRemaining <= 0) {
        throw new ApiError(403, 'Free interview limit reached. Please upgrade.', 'LIMIT_REACHED');
    }

    // Create session
    const sessionId = uuidv4();

    const session = await InterviewSession.create({
        user: req.userId,
        sessionId,
        interviewType,
        subCategory: subCategory || null,
        personality: personality || user.preferences.interviewerPersonality,
        targetCompany,
        targetRole,
        difficulty: {
            initial: difficulty || user.preferences.difficultyLevel,
            current: difficulty || user.preferences.difficultyLevel
        },
        voiceEnabled: voiceEnabled ?? user.preferences.voiceEnabled,
        totalQuestions: totalQuestions || 10,
        status: 'in-progress',
        startedAt: new Date()
    });

    // Decrement interview count for free users
    if (user.subscription.plan === 'free') {
        user.subscription.interviewsRemaining -= 1;
        await user.save();
    }

    // Initialize AI session
    const aiContext = {
        interviewType,
        personality: session.personality,
        difficulty: session.difficulty.current,
        targetCompany,
        targetRole,
        userProfile: {
            experience: user.profile.experience,
            skills: user.profile.skills
        }
    };

    // Generate first question
    const firstQuestion = await geminiService.generateQuestion(sessionId, aiContext);

    // Extract question text and type, handling both AI response and fallback formats
    const questionText = firstQuestion.questionText || firstQuestion.content || firstQuestion.question || 'Tell me about yourself.';
    const questionType = firstQuestion.questionType || firstQuestion.type || 'open-ended';
    // Validate questionType against allowed values
    const validTypes = ['open-ended', 'technical', 'coding', 'scenario', 'follow-up'];
    const safeQuestionType = validTypes.includes(questionType) ? questionType : 'open-ended';

    // Add first question to session
    session.responses.push({
        questionIndex: 0,
        question: {
            questionText: questionText,
            questionType: safeQuestionType,
            difficulty: session.difficulty.current,
            timeAllowed: 120,
            expectedTopics: firstQuestion.expectedTopics || []
        },
        startedAt: new Date()
    });

    await session.save();

    logger.info(`Interview started: ${sessionId} for user ${user.email}`);

    res.status(201).json({
        success: true,
        message: 'Interview started successfully',
        data: {
            sessionId: session.sessionId,
            interviewType: session.interviewType,
            personality: session.personality,
            difficulty: session.difficulty.current,
            totalQuestions: session.totalQuestions,
            currentQuestion: {
                index: 0,
                question: questionText,
                type: safeQuestionType,
                difficulty: session.difficulty.current,
                expectedTopics: firstQuestion.expectedTopics || [],
                timeAllowed: 120
            },
            voiceEnabled: session.voiceEnabled
        }
    });
});

/**
 * Submit answer and get next question
 * POST /api/interviews/:sessionId/answer
 */
export const submitAnswer = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { answer, audioData } = req.body;

    const session = await InterviewSession.findOne({
        sessionId,
        user: req.userId,
        status: 'in-progress'
    });

    if (!session) {
        throw new ApiError(404, 'Active interview session not found');
    }

    const currentIndex = session.currentQuestionIndex;
    const currentResponse = session.responses[currentIndex];

    if (!currentResponse) {
        throw new ApiError(400, 'No active question to answer');
    }

    // Analyze voice if audio is provided
    let voiceAnalysis = null;
    if (audioData && session.voiceEnabled) {
        try {
            const audioBuffer = Buffer.from(audioData, 'base64');
            voiceAnalysis = await speechService.transcribeAndAnalyze(audioBuffer);
        } catch (error) {
            logger.error('Voice analysis failed:', error);
        }
    }

    // Get the text answer (from input or transcription)
    const answerText = answer || voiceAnalysis?.transcription || '';

    // Evaluate answer with AI
    const evaluation = await geminiService.evaluateAnswer(
        sessionId,
        currentResponse.question,
        answerText,
        voiceAnalysis
    );

    // Calculate scores
    const scores = analyticsService.calculateResponseScore(evaluation, voiceAnalysis);

    // Update response with answer and evaluation
    currentResponse.answer = {
        text: answerText,
        audioUrl: null, // Would be set if we store audio in GCS
        duration: audioData ? audioData.length / 16000 : 0 // Approximate duration
    };
    currentResponse.voiceAnalysis = voiceAnalysis || {};
    currentResponse.scores = scores;
    currentResponse.aiAnalysis = {
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        suggestions: evaluation.suggestions || [],
        keyTopicsCovered: evaluation.keyTopicsCovered || [],
        keyTopicsMissed: evaluation.keyTopicsMissed || []
    };
    currentResponse.completedAt = new Date();

    // Check if we should adjust difficulty
    const recentScores = session.responses
        .slice(-3)
        .map(r => r.scores?.overall || 0)
        .filter(s => s > 0);

    const difficultyAdjustment = analyticsService.shouldAdjustDifficulty(
        recentScores,
        session.difficulty.current
    );

    if (difficultyAdjustment.adjust) {
        session.adjustDifficulty(difficultyAdjustment.direction);
        logger.info(`Difficulty adjusted to ${session.difficulty.current} for session ${sessionId}`);
    }

    // Increment question index
    session.questionsAnswered += 1;
    session.currentQuestionIndex += 1;
    session.lastActivityAt = new Date();

    // Check if interview is complete
    const isComplete = session.questionsAnswered >= session.totalQuestions;

    let nextQuestion = null;
    let followUpGenerated = false;

    if (!isComplete) {
        // Check if we should generate a follow-up question
        if (evaluation.shouldGenerateFollowUp && scores.overall < 70) {
            const followUp = await geminiService.generateFollowUp(
                sessionId,
                currentResponse.question.questionText,
                answerText,
                evaluation
            );

            if (followUp?.question) {
                currentResponse.followUpQuestion = {
                    generated: true,
                    question: followUp.question
                };
                followUpGenerated = true;

                nextQuestion = {
                    index: session.currentQuestionIndex,
                    question: followUp.question,
                    type: 'follow-up',
                    difficulty: session.difficulty.current,
                    isFollowUp: true
                };
            }
        }

        // Generate next regular question if no follow-up
        if (!nextQuestion) {
            const aiContext = {
                interviewType: session.interviewType,
                personality: session.personality,
                difficulty: session.difficulty.current,
                targetCompany: session.targetCompany,
                targetRole: session.targetRole
            };

            const newQuestion = await geminiService.generateQuestion(
                sessionId,
                aiContext,
                session.responses
            );

            // Extract and validate question properties
            const newQuestionText = newQuestion.questionText || newQuestion.content || newQuestion.question || 'Tell me more about your experience.';
            const newQuestionType = newQuestion.questionType || newQuestion.type || 'open-ended';
            const validTypes = ['open-ended', 'technical', 'coding', 'scenario', 'follow-up'];
            const safeNewQuestionType = validTypes.includes(newQuestionType) ? newQuestionType : 'open-ended';

            nextQuestion = {
                index: session.currentQuestionIndex,
                question: newQuestionText,
                type: safeNewQuestionType,
                difficulty: session.difficulty.current,
                expectedTopics: newQuestion.expectedTopics || []
            };

            // Add new question to session
            session.responses.push({
                questionIndex: session.currentQuestionIndex,
                question: {
                    questionText: newQuestionText,
                    questionType: safeNewQuestionType,
                    difficulty: session.difficulty.current,
                    timeAllowed: 120,
                    expectedTopics: newQuestion.expectedTopics || []
                },
                startedAt: new Date()
            });
        }
    } else {
        // Interview complete
        session.status = 'completed';
        session.completedAt = new Date();

        // Calculate overall scores
        session.calculateOverallScores();

        // Calculate analytics
        session.analytics = analyticsService.calculateSessionAnalytics(session);

        // Update user statistics
        const user = await User.findById(req.userId);
        user.statistics.totalInterviews += 1;
        user.statistics.totalQuestions += session.questionsAnswered;
        user.statistics.lastInterviewDate = new Date();

        // Update average score
        const totalScore = user.statistics.averageScore * (user.statistics.totalInterviews - 1);
        user.statistics.averageScore = (totalScore + session.overallScores.overall) / user.statistics.totalInterviews;

        await user.save();
    }

    await session.save();

    res.json({
        success: true,
        data: {
            evaluation: {
                scores,
                strengths: evaluation.strengths || [],
                weaknesses: evaluation.weaknesses || [],
                suggestions: evaluation.suggestions || []
            },
            voiceAnalysis: voiceAnalysis ? {
                confidence: voiceAnalysis.confidence,
                clarityScore: voiceAnalysis.clarityScore,
                wordsPerMinute: voiceAnalysis.wordsPerMinute,
                hesitationCount: voiceAnalysis.hesitationCount,
                fillerWords: voiceAnalysis.fillerWords?.slice(0, 5)
            } : null,
            difficultyAdjusted: difficultyAdjustment.adjust,
            newDifficulty: session.difficulty.current,
            isComplete,
            progress: {
                answered: session.questionsAnswered,
                total: session.totalQuestions,
                percentage: Math.round((session.questionsAnswered / session.totalQuestions) * 100)
            },
            nextQuestion: isComplete ? null : nextQuestion,
            followUpGenerated
        }
    });
});

/**
 * Get interview session status
 * GET /api/interviews/:sessionId
 */
export const getSessionStatus = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOne({
        sessionId,
        user: req.userId
    });

    if (!session) {
        throw new ApiError(404, 'Interview session not found');
    }

    res.json({
        success: true,
        data: {
            sessionId: session.sessionId,
            status: session.status,
            interviewType: session.interviewType,
            personality: session.personality,
            difficulty: session.difficulty,
            progress: {
                answered: session.questionsAnswered,
                total: session.totalQuestions,
                percentage: session.completionPercentage
            },
            duration: session.duration,
            overallScores: session.status === 'completed' ? session.overallScores : null,
            startedAt: session.startedAt,
            completedAt: session.completedAt
        }
    });
});

/**
 * End interview early
 * POST /api/interviews/:sessionId/end
 */
export const endInterview = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOne({
        sessionId,
        user: req.userId,
        status: 'in-progress'
    });

    if (!session) {
        throw new ApiError(404, 'Active interview session not found');
    }

    session.status = 'completed';
    session.completedAt = new Date();

    // Calculate scores even if ended early
    session.calculateOverallScores();
    session.analytics = analyticsService.calculateSessionAnalytics(session);

    // Clear AI session
    geminiService.clearSession(sessionId);

    await session.save();

    res.json({
        success: true,
        message: 'Interview ended',
        data: {
            sessionId: session.sessionId,
            questionsAnswered: session.questionsAnswered,
            overallScores: session.overallScores
        }
    });
});

/**
 * Get interview history
 * GET /api/interviews/history
 */
export const getInterviewHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type, status } = req.query;

    const query = { user: req.userId };
    if (type) query.interviewType = type;
    if (status) query.status = status;

    const sessions = await InterviewSession.find(query)
        .select('sessionId interviewType personality difficulty status overallScores questionsAnswered totalQuestions startedAt completedAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await InterviewSession.countDocuments(query);

    res.json({
        success: true,
        data: {
            interviews: sessions.map(s => ({
                sessionId: s.sessionId,
                interviewType: s.interviewType,
                personality: s.personality,
                difficulty: s.difficulty.initial,
                status: s.status,
                score: s.overallScores?.overall || 0,
                questionsAnswered: s.questionsAnswered,
                totalQuestions: s.totalQuestions,
                startedAt: s.startedAt,
                completedAt: s.completedAt,
                duration: s.duration
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

/**
 * Get full interview report
 * GET /api/interviews/:sessionId/report
 */
export const getInterviewReport = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOne({
        sessionId,
        user: req.userId
    });

    if (!session) {
        throw new ApiError(404, 'Interview session not found');
    }

    // Generate AI summary if not already generated
    let summary = session.analytics?.improvementPlan?.summary;

    if (!summary && session.status === 'completed') {
        try {
            const aiSummary = await geminiService.generateInterviewSummary(sessionId, {
                interviewType: session.interviewType,
                totalQuestions: session.totalQuestions,
                duration: session.duration / 60, // Convert to minutes
                overallScores: session.overallScores,
                difficultyProgression: session.analytics?.difficultyProgression,
                responses: session.responses
            });

            // Update session with AI-generated improvement plan
            if (aiSummary) {
                session.analytics.improvementPlan = {
                    summary: aiSummary.overallAssessment || '',
                    focusAreas: aiSummary.improvementPlan?.focusAreas || [],
                    recommendedPractice: aiSummary.improvementPlan?.recommendedPractice || [],
                    resources: aiSummary.improvementPlan?.resources || []
                };
                session.analytics.strengthAreas = aiSummary.strengthAreas || [];
                session.analytics.weaknessAreas = aiSummary.weaknessAreas || [];

                await session.save();
                summary = aiSummary;
            }
        } catch (error) {
            logger.error('Failed to generate AI summary:', error);
        }
    }

    res.json({
        success: true,
        data: {
            session: {
                sessionId: session.sessionId,
                interviewType: session.interviewType,
                subCategory: session.subCategory,
                personality: session.personality,
                targetCompany: session.targetCompany,
                targetRole: session.targetRole,
                status: session.status,
                voiceEnabled: session.voiceEnabled,
                startedAt: session.startedAt,
                completedAt: session.completedAt,
                duration: session.duration
            },
            difficulty: session.difficulty,
            progress: {
                questionsAnswered: session.questionsAnswered,
                totalQuestions: session.totalQuestions
            },
            overallScores: session.overallScores,
            analytics: session.analytics,
            responses: session.responses.map(r => ({
                questionIndex: r.questionIndex,
                question: r.question?.questionText,
                difficulty: r.question?.difficulty,
                answer: r.answer?.text?.substring(0, 200) + (r.answer?.text?.length > 200 ? '...' : ''),
                scores: r.scores,
                strengths: r.aiAnalysis?.strengths,
                weaknesses: r.aiAnalysis?.weaknesses,
                suggestions: r.aiAnalysis?.suggestions,
                voiceMetrics: r.voiceAnalysis ? {
                    confidence: r.voiceAnalysis.confidence,
                    clarityScore: r.voiceAnalysis.clarityScore,
                    hesitationCount: r.voiceAnalysis.hesitationCount
                } : null
            })),
            summary: summary || null
        }
    });
});

export default {
    startInterview,
    submitAnswer,
    getSessionStatus,
    endInterview,
    getInterviewHistory,
    getInterviewReport
};
