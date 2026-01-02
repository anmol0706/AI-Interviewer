import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useInterviewStore } from '../../stores/interviewStore';
import { interviewService } from '../../services/interviewService';
import toast from 'react-hot-toast';
import {
    Mic,
    MicOff,
    Send,
    Pause,
    Play,
    StopCircle,
    Clock,
    Brain,
    CheckCircle,
    AlertCircle,
    Loader2,
    Volume2,
    ChevronRight
} from 'lucide-react';

export default function InterviewRoom() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const textareaRef = useRef(null);

    const {
        session,
        currentQuestion,
        questionIndex,
        totalQuestions,
        isInterviewActive,
        isPaused,
        isRecording,
        isProcessing,
        isConnected,
        currentAnswer,
        lastEvaluation,
        voiceAnalysis,
        sessionCompleted,
        sessionError,
        setCurrentAnswer,
        setVoiceAnalysis,
        startRecording,
        stopRecording,
        initSocket,
        joinInterview,
        submitAnswerSocket,
        pauseInterview,
        resumeInterview,
        clearInterview
    } = useInterviewStore();

    const [timer, setTimer] = useState(120);
    const [showFeedback, setShowFeedback] = useState(false);
    const hasJoinedRef = useRef(false);

    // Get socket from store (subscribe to it)
    const socket = useInterviewStore((state) => state.socket);

    // Initialize socket and join interview
    useEffect(() => {
        initSocket();

        return () => {
            clearInterview();
        };
    }, [initSocket, clearInterview]);

    // Join interview when socket is connected
    useEffect(() => {
        if (sessionId && socket && isConnected && !hasJoinedRef.current) {
            hasJoinedRef.current = true;
            joinInterview(sessionId);
        }
    }, [sessionId, socket, isConnected, joinInterview]);

    // Redirect to report if interview is already completed
    useEffect(() => {
        if (sessionCompleted && session?.sessionId) {
            navigate(`/interview/${session.sessionId}/report`);
        }
    }, [sessionCompleted, session, navigate]);

    // Handle session errors (e.g., session not found)
    useEffect(() => {
        if (sessionError) {
            toast.error(sessionError);
            navigate('/dashboard');
        }
    }, [sessionError, navigate]);

    // Timer countdown
    useEffect(() => {
        if (!isInterviewActive || isPaused || isProcessing) return;

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    return 0; // Just set to 0, don't call handleSubmit here
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isInterviewActive, isPaused, isProcessing]);

    // Auto-submit when timer reaches zero
    useEffect(() => {
        if (timer === 0 && isInterviewActive && !isProcessing) {
            const answer = currentAnswer || voiceAnalysis?.transcription;
            if (answer?.trim()) {
                submitAnswerSocket(answer);
            }
            setTimer(120); // Reset timer
        }
    }, [timer, isInterviewActive, isProcessing, currentAnswer, voiceAnalysis, submitAnswerSocket]);

    // Reset timer on new question
    useEffect(() => {
        setTimer(120);
        setShowFeedback(false);
    }, [questionIndex]);

    // Show feedback when evaluation is received
    useEffect(() => {
        if (lastEvaluation) {
            setShowFeedback(true);
        }
    }, [lastEvaluation]);

    const endMutation = useMutation({
        mutationFn: () => interviewService.endInterview(sessionId),
        onSuccess: () => {
            navigate(`/interview/${sessionId}/report`);
        }
    });

    const handleSubmit = async () => {
        if (!currentAnswer.trim() && !voiceAnalysis?.transcription) {
            toast.error('Please provide an answer');
            return;
        }

        if (isRecording) {
            await stopRecording();
        }

        submitAnswerSocket(currentAnswer || voiceAnalysis?.transcription);
    };

    const handleRecordToggle = async () => {
        try {
            if (isRecording) {
                await stopRecording();
            } else {
                await startRecording();
                toast.success('Recording started');
            }
        } catch (error) {
            toast.error('Microphone access denied');
        }
    };

    const handleEndInterview = () => {
        if (confirm('Are you sure you want to end the interview?')) {
            endMutation.mutate();
        }
    };

    const handleContinue = () => {
        setShowFeedback(false);
        setCurrentAnswer('');
        setVoiceAnalysis(null);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-success-400';
        if (score >= 60) return 'text-primary-400';
        if (score >= 40) return 'text-warning-400';
        return 'text-error-400';
    };

    if (!session && !currentQuestion) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-3" />
                    <p className="text-dark-400 text-xs sm:text-sm">Loading interview...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-5">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400 text-[10px] sm:text-xs font-medium capitalize">{session?.interviewType}</span>
                    <span className="px-2 py-0.5 rounded-full bg-dark-800 text-dark-400 text-[10px] sm:text-xs capitalize">{session?.difficulty}</span>
                    <span className="text-dark-500 text-[10px] sm:text-xs">Q{questionIndex + 1}/{totalQuestions}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Timer */}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] sm:text-xs font-mono ${timer <= 30 ? 'bg-error-500/20 text-error-400' : 'bg-dark-800/80 text-dark-400'}`}>
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(timer)}</span>
                    </div>

                    {/* Pause/Resume */}
                    <button
                        onClick={isPaused ? resumeInterview : pauseInterview}
                        className="p-1.5 rounded-md bg-dark-800/50 text-dark-400 hover:bg-dark-700 transition-colors"
                    >
                        {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>

                    {/* End Interview */}
                    <button
                        onClick={handleEndInterview}
                        className="px-2 py-1.5 rounded-md bg-error-500/20 text-error-400 hover:bg-error-500/30 text-[10px] sm:text-xs font-medium flex items-center gap-1 transition-colors"
                        disabled={endMutation.isPending}
                    >
                        <StopCircle className="w-3 h-3" />
                        <span className="hidden sm:inline">End</span>
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-dark-800/50 rounded-full mb-4 sm:mb-6 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((questionIndex) / totalQuestions) * 100}%` }}
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                />
            </div>

            {/* Question Card */}
            <motion.div
                key={questionIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-900/80 backdrop-blur-sm rounded-lg border border-dark-800/50 p-3 sm:p-4 mb-3 sm:mb-4"
            >
                <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2 flex-wrap">
                            <span className="text-[10px] sm:text-xs text-primary-400 font-medium">
                                AI Interviewer
                            </span>
                            {currentQuestion?.difficulty && (
                                <span className="px-1.5 py-0.5 rounded bg-dark-800/80 text-dark-400 text-[9px] sm:text-xs capitalize">
                                    {currentQuestion.difficulty}
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm md:text-base text-white leading-relaxed">
                            {currentQuestion?.question || currentQuestion?.questionText}
                        </p>
                        {currentQuestion?.expectedTopics?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                                {currentQuestion.expectedTopics.map((topic, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-dark-800/50 rounded text-[9px] sm:text-xs text-dark-500">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Answer Section */}
            <AnimatePresence mode="wait">
                {showFeedback && lastEvaluation ? (
                    /* Feedback Card - Mobile responsive */
                    <motion.div
                        key="feedback"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card p-4 sm:p-6 md:p-8"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success-400" />
                                Answer Feedback
                            </h3>
                            <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(lastEvaluation.scores?.overall?.score || lastEvaluation.scores?.overall || 0)}`}>
                                {lastEvaluation.scores?.overall?.score || lastEvaluation.scores?.overall || 0}%
                            </div>
                        </div>

                        {/* Score Breakdown - 2 cols mobile, 5 cols desktop */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
                            {['correctness', 'reasoning', 'communication', 'structure', 'confidence'].map((metric) => {
                                const score = lastEvaluation.scores?.[metric]?.score || 0;
                                return (
                                    <div key={metric} className="text-center">
                                        <div className={`text-lg sm:text-xl md:text-2xl font-bold ${getScoreColor(score)}`}>
                                            {score}%
                                        </div>
                                        <div className="text-dark-400 text-xs capitalize">{metric}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Strengths & Weaknesses - Stack on mobile */}
                        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mb-4 sm:mb-6">
                            {lastEvaluation.strengths?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-success-400 mb-2">Strengths</h4>
                                    <ul className="space-y-1">
                                        {lastEvaluation.strengths.slice(0, 3).map((s, i) => (
                                            <li key={i} className="text-dark-300 text-sm flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-success-400 flex-shrink-0 mt-0.5" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {lastEvaluation.weaknesses?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-warning-400 mb-2">Areas to Improve</h4>
                                    <ul className="space-y-1">
                                        {lastEvaluation.weaknesses.slice(0, 3).map((w, i) => (
                                            <li key={i} className="text-dark-300 text-sm flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 text-warning-400 flex-shrink-0 mt-0.5" />
                                                {w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Voice Analysis - 2 cols mobile, 4 cols desktop */}
                        {voiceAnalysis && (
                            <div className="p-3 sm:p-4 bg-dark-800/50 rounded-xl mb-4 sm:mb-6">
                                <h4 className="text-xs sm:text-sm font-medium text-dark-300 mb-3 flex items-center gap-2">
                                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    Voice Analysis
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center text-sm">
                                    <div>
                                        <div className="text-base sm:text-lg font-semibold text-white">{voiceAnalysis.confidence}%</div>
                                        <div className="text-dark-400 text-xs">Confidence</div>
                                    </div>
                                    <div>
                                        <div className="text-base sm:text-lg font-semibold text-white">{voiceAnalysis.clarityScore}%</div>
                                        <div className="text-dark-400 text-xs">Clarity</div>
                                    </div>
                                    <div>
                                        <div className="text-base sm:text-lg font-semibold text-white">{voiceAnalysis.wordsPerMinute}</div>
                                        <div className="text-dark-400 text-xs">WPM</div>
                                    </div>
                                    <div>
                                        <div className="text-base sm:text-lg font-semibold text-white">{voiceAnalysis.hesitationCount}</div>
                                        <div className="text-dark-400 text-xs">Hesitations</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Continue Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleContinue}
                                className="btn-primary w-full sm:w-auto"
                            >
                                <span className="hidden sm:inline">Continue to Next Question</span>
                                <span className="sm:hidden">Next Question</span>
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* Answer Input */
                    <motion.div
                        key="answer"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="bg-dark-900/80 backdrop-blur-sm rounded-lg border border-dark-800/50 p-3 sm:p-4"
                    >
                        {/* Voice Recording Indicator */}
                        {isRecording && (
                            <div className="flex items-center gap-2 mb-3 p-2.5 bg-error-500/15 rounded-lg">
                                <div className="w-2 h-2 bg-error-500 rounded-full animate-pulse" />
                                <span className="text-error-400 text-xs font-medium">Recording...</span>
                            </div>
                        )}

                        {/* Transcription Preview */}
                        {voiceAnalysis?.transcription && (
                            <div className="mb-3 p-2.5 bg-dark-800/50 rounded-lg">
                                <p className="text-[10px] text-dark-500 mb-0.5">Transcription:</p>
                                <p className="text-white text-xs sm:text-sm">{voiceAnalysis.transcription}</p>
                            </div>
                        )}

                        {/* Text Input */}
                        <textarea
                            ref={textareaRef}
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            placeholder="Type your answer here or use the microphone..."
                            className="w-full bg-dark-800/50 border border-dark-700/50 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white placeholder-dark-500 min-h-[120px] sm:min-h-[150px] resize-none mb-3 focus:outline-none focus:border-primary-500/50"
                            disabled={isRecording || isPaused || isProcessing}
                        />

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {/* Voice Button */}
                                {session?.voiceEnabled && (
                                    <button
                                        onClick={handleRecordToggle}
                                        disabled={isPaused || isProcessing}
                                        className={`p-2 rounded-lg transition-all ${isRecording
                                            ? 'bg-error-500 text-white animate-pulse'
                                            : 'bg-dark-800/50 text-dark-400 hover:bg-dark-700'
                                            }`}
                                    >
                                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={(!currentAnswer.trim() && !voiceAnalysis?.transcription) || isProcessing || isPaused}
                                className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span className="hidden sm:inline">Processing</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5" />
                                        Submit
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Paused Overlay */}
            {isPaused && (
                <div className="fixed inset-0 bg-dark-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="text-center">
                        <Pause className="w-10 h-10 sm:w-12 sm:h-12 text-primary-400 mx-auto mb-3" />
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Interview Paused</h2>
                        <p className="text-dark-400 text-xs sm:text-sm mb-4">Take your time. Click resume when ready.</p>
                        <button onClick={resumeInterview} className="bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 mx-auto transition-all">
                            <Play className="w-4 h-4" />
                            Resume
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
