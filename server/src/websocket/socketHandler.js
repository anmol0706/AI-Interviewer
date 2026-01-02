import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { InterviewSession } from '../models/index.js';
import { geminiService } from '../services/ai/index.js';
import { speechService } from '../services/speech/index.js';
import { analyticsService } from '../services/analytics/index.js';

/**
 * Initialize WebSocket handlers
 */
export function initializeSocket(io) {
    // Authentication middleware for Socket.io
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, config.jwt.secret);
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id} (User: ${socket.userId})`);

        // Join user-specific room
        socket.join(`user:${socket.userId}`);

        /**
         * Join an interview session room
         */
        socket.on('join-interview', async ({ sessionId }) => {
            try {
                // First try to find any session with this ID for this user
                const session = await InterviewSession.findOne({
                    sessionId,
                    user: socket.userId
                });

                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                // Handle different session states
                if (session.status === 'completed') {
                    socket.emit('interview-already-complete', {
                        sessionId: session.sessionId,
                        status: 'completed',
                        overallScores: session.overallScores,
                        completedAt: session.completedAt,
                        analytics: session.analytics
                    });
                    return;
                }

                if (session.status === 'abandoned') {
                    socket.emit('error', { message: 'Session was abandoned' });
                    return;
                }

                // For in-progress or paused sessions, allow joining
                socket.join(`interview:${sessionId}`);
                socket.currentSessionId = sessionId;

                socket.emit('interview-joined', {
                    sessionId: session.sessionId,
                    status: session.status,
                    interviewType: session.interviewType,
                    difficulty: session.difficulty?.current || session.difficulty,
                    voiceEnabled: session.voiceEnabled,
                    currentQuestion: session.responses[session.currentQuestionIndex]?.question,
                    progress: {
                        current: session.currentQuestionIndex + 1,
                        total: session.totalQuestions
                    }
                });

                logger.info(`User ${socket.userId} joined interview ${sessionId}`);
            } catch (error) {
                logger.error('Error joining interview:', error);
                socket.emit('error', { message: 'Failed to join interview' });
            }
        });

        /**
         * Handle real-time audio streaming for voice analysis
         */
        socket.on('audio-stream', async ({ sessionId, audioChunk }) => {
            try {
                if (!socket.audioBuffer) {
                    socket.audioBuffer = [];
                }

                // Accumulate audio chunks
                socket.audioBuffer.push(audioChunk);

                // Emit acknowledgment
                socket.emit('audio-received', {
                    chunksReceived: socket.audioBuffer.length
                });
            } catch (error) {
                logger.error('Audio stream error:', error);
                socket.emit('error', { message: 'Audio processing failed' });
            }
        });

        /**
         * Process accumulated audio and get transcription
         */
        socket.on('audio-complete', async ({ sessionId }) => {
            try {
                if (!socket.audioBuffer || socket.audioBuffer.length === 0) {
                    socket.emit('transcription-error', { message: 'No audio data received' });
                    return;
                }

                // Combine audio chunks
                const audioData = Buffer.concat(
                    socket.audioBuffer.map(chunk => Buffer.from(chunk, 'base64'))
                );

                // Analyze audio
                const analysis = await speechService.transcribeAndAnalyze(audioData);

                socket.emit('transcription-complete', {
                    transcription: analysis.transcription,
                    confidence: analysis.confidence,
                    clarityScore: analysis.clarityScore,
                    hesitationCount: analysis.hesitationCount,
                    fillerWords: analysis.fillerWords,
                    wordsPerMinute: analysis.wordsPerMinute
                });

                // Store analysis for this response
                socket.lastVoiceAnalysis = analysis;

                // Clear audio buffer
                socket.audioBuffer = [];

                logger.info(`Audio processed for session ${sessionId}`);
            } catch (error) {
                logger.error('Audio processing error:', error);
                socket.emit('transcription-error', { message: 'Failed to process audio' });
            }
        });

        /**
         * Real-time answer submission with streaming response
         */
        socket.on('submit-answer', async ({ sessionId, answer }) => {
            try {
                const session = await InterviewSession.findOne({
                    sessionId,
                    user: socket.userId,
                    status: 'in-progress'
                });

                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                // Emit processing status
                socket.emit('answer-processing', { status: 'evaluating' });

                const currentResponse = session.responses[session.currentQuestionIndex];
                const voiceAnalysis = socket.lastVoiceAnalysis || null;

                // Evaluate answer
                const evaluation = await geminiService.evaluateAnswer(
                    sessionId,
                    currentResponse.question,
                    answer,
                    voiceAnalysis
                );

                // Calculate scores
                const scores = analyticsService.calculateResponseScore(evaluation, voiceAnalysis);

                // Update session
                currentResponse.answer = { text: answer, duration: 0 };
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

                // Emit evaluation result
                socket.emit('answer-evaluated', {
                    scores,
                    feedback: {
                        strengths: evaluation.strengths,
                        weaknesses: evaluation.weaknesses,
                        suggestions: evaluation.suggestions
                    }
                });

                // Check difficulty adjustment
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
                    socket.emit('difficulty-adjusted', {
                        newDifficulty: session.difficulty.current,
                        reason: difficultyAdjustment.reason
                    });
                }

                // Update progress
                session.questionsAnswered += 1;
                session.currentQuestionIndex += 1;
                session.lastActivityAt = new Date();

                const isComplete = session.questionsAnswered >= session.totalQuestions;

                if (isComplete) {
                    session.status = 'completed';
                    session.completedAt = new Date();
                    session.calculateOverallScores();
                    session.analytics = analyticsService.calculateSessionAnalytics(session);

                    await session.save();

                    socket.emit('interview-complete', {
                        sessionId: session.sessionId,
                        overallScores: session.overallScores,
                        analytics: session.analytics
                    });

                    // Clear session from Gemini
                    geminiService.clearSession(sessionId);

                    // Clear voice analysis
                    socket.lastVoiceAnalysis = null;

                    logger.info(`Interview completed via socket: ${sessionId}`);
                } else {
                    // Generate next question
                    socket.emit('answer-processing', { status: 'generating-question' });

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

                    // Add to session
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

                    await session.save();

                    socket.emit('next-question', {
                        index: session.currentQuestionIndex,
                        question: newQuestionText,
                        type: safeNewQuestionType,
                        difficulty: session.difficulty.current,
                        expectedTopics: newQuestion.expectedTopics || [],
                        progress: {
                            current: session.currentQuestionIndex + 1,
                            total: session.totalQuestions
                        }
                    });
                }

                // Clear voice analysis for next question
                socket.lastVoiceAnalysis = null;

            } catch (error) {
                logger.error('Answer submission error:', error);
                socket.emit('error', { message: 'Failed to process answer' });
            }
        });

        /**
         * Pause interview
         */
        socket.on('pause-interview', async ({ sessionId }) => {
            try {
                await InterviewSession.findOneAndUpdate(
                    { sessionId, user: socket.userId },
                    { status: 'paused', pausedAt: new Date() }
                );

                socket.emit('interview-paused', { sessionId });
                logger.info(`Interview paused: ${sessionId}`);
            } catch (error) {
                logger.error('Pause error:', error);
                socket.emit('error', { message: 'Failed to pause interview' });
            }
        });

        /**
         * Resume interview
         */
        socket.on('resume-interview', async ({ sessionId }) => {
            try {
                const session = await InterviewSession.findOneAndUpdate(
                    { sessionId, user: socket.userId, status: 'paused' },
                    { status: 'in-progress', $unset: { pausedAt: 1 } },
                    { new: true }
                );

                if (!session) {
                    socket.emit('error', { message: 'No paused session found' });
                    return;
                }

                socket.emit('interview-resumed', {
                    sessionId,
                    currentQuestion: session.responses[session.currentQuestionIndex]?.question,
                    progress: {
                        current: session.currentQuestionIndex + 1,
                        total: session.totalQuestions
                    }
                });

                logger.info(`Interview resumed: ${sessionId}`);
            } catch (error) {
                logger.error('Resume error:', error);
                socket.emit('error', { message: 'Failed to resume interview' });
            }
        });

        /**
         * Leave interview session
         */
        socket.on('leave-interview', ({ sessionId }) => {
            socket.leave(`interview:${sessionId}`);
            socket.currentSessionId = null;
            socket.audioBuffer = [];
            socket.lastVoiceAnalysis = null;
            logger.info(`User ${socket.userId} left interview ${sessionId}`);
        });

        /**
         * Handle disconnection
         */
        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);

            // Clean up
            socket.audioBuffer = [];
            socket.lastVoiceAnalysis = null;
        });

        /**
         * Handle errors
         */
        socket.on('error', (error) => {
            logger.error(`Socket error for ${socket.id}:`, error);
        });
    });

    return io;
}

export default { initializeSocket };
