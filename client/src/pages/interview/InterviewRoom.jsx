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
        setCurrentAnswer,
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

    // Initialize socket and join interview
    useEffect(() => {
        initSocket();

        return () => {
            clearInterview();
        };
    }, []);

    // Join interview when socket is connected

    useEffect(() => {
        const { socket } = useInterviewStore.getState();
        if (sessionId && socket && isConnected && !hasJoinedRef.current) {
            hasJoinedRef.current = true;
            joinInterview(sessionId);
        }
    }, [sessionId, isConnected, joinInterview]);

    // Redirect to report if interview is already completed
    useEffect(() => {
        if (sessionCompleted && session?.sessionId) {
            navigate(`/interview/${session.sessionId}/report`);
        }
    }, [sessionCompleted, session, navigate]);

    // Timer countdown
    useEffect(() => {
        if (!isInterviewActive || isPaused || isProcessing) return;

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    // Auto-submit when time is up
                    handleSubmit();
                    return 120;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isInterviewActive, isPaused, isProcessing]);

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
                    <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-dark-400">Loading interview session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="badge-primary capitalize">{session?.interviewType}</span>
                        <span className="badge-secondary capitalize">{session?.difficulty}</span>
                    </div>
                    <div className="text-dark-400 text-sm">
                        Question {questionIndex + 1} of {totalQuestions}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timer <= 30 ? 'bg-error-500/20 text-error-400' : 'bg-dark-800 text-dark-300'
                        }`}>
                        <Clock className="w-5 h-5" />
                        <span className="font-mono text-lg">{formatTime(timer)}</span>
                    </div>

                    {/* Pause/Resume */}
                    <button
                        onClick={isPaused ? resumeInterview : pauseInterview}
                        className="btn-ghost"
                    >
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </button>

                    {/* End Interview */}
                    <button
                        onClick={handleEndInterview}
                        className="btn-danger"
                        disabled={endMutation.isPending}
                    >
                        <StopCircle className="w-5 h-5" />
                        End
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-dark-800 rounded-full mb-8 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((questionIndex) / totalQuestions) * 100}%` }}
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                />
            </div>

            {/* Question Card */}
            <motion.div
                key={questionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 mb-6"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-6 h-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-primary-400 font-medium">
                                AI Interviewer
                            </span>
                            {currentQuestion?.difficulty && (
                                <span className="badge-secondary text-xs capitalize">
                                    {currentQuestion.difficulty}
                                </span>
                            )}
                        </div>
                        <p className="text-xl text-white leading-relaxed">
                            {currentQuestion?.question || currentQuestion?.questionText}
                        </p>
                        {currentQuestion?.expectedTopics?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {currentQuestion.expectedTopics.map((topic, i) => (
                                    <span key={i} className="px-2 py-1 bg-dark-800/50 rounded text-xs text-dark-400">
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
                    /* Feedback Card */
                    <motion.div
                        key="feedback"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card p-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-success-400" />
                                Answer Feedback
                            </h3>
                            <div className={`text-3xl font-bold ${getScoreColor(lastEvaluation.scores?.overall?.score || lastEvaluation.scores?.overall || 0)}`}>
                                {lastEvaluation.scores?.overall?.score || lastEvaluation.scores?.overall || 0}%
                            </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            {['correctness', 'reasoning', 'communication', 'structure', 'confidence'].map((metric) => {
                                const score = lastEvaluation.scores?.[metric]?.score || 0;
                                return (
                                    <div key={metric} className="text-center">
                                        <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                                            {score}%
                                        </div>
                                        <div className="text-dark-400 text-xs capitalize">{metric}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
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

                        {/* Voice Analysis */}
                        {voiceAnalysis && (
                            <div className="p-4 bg-dark-800/50 rounded-xl mb-6">
                                <h4 className="text-sm font-medium text-dark-300 mb-3 flex items-center gap-2">
                                    <Volume2 className="w-4 h-4" />
                                    Voice Analysis
                                </h4>
                                <div className="grid grid-cols-4 gap-4 text-center text-sm">
                                    <div>
                                        <div className="text-lg font-semibold text-white">{voiceAnalysis.confidence}%</div>
                                        <div className="text-dark-400">Confidence</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-white">{voiceAnalysis.clarityScore}%</div>
                                        <div className="text-dark-400">Clarity</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-white">{voiceAnalysis.wordsPerMinute}</div>
                                        <div className="text-dark-400">WPM</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-white">{voiceAnalysis.hesitationCount}</div>
                                        <div className="text-dark-400">Hesitations</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Continue Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleContinue}
                                className="btn-primary"
                            >
                                Continue to Next Question
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* Answer Input */
                    <motion.div
                        key="answer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card p-6"
                    >
                        {/* Voice Recording Indicator */}
                        {isRecording && (
                            <div className="flex items-center gap-3 mb-4 p-4 bg-error-500/20 rounded-xl">
                                <div className="w-3 h-3 bg-error-500 rounded-full animate-pulse" />
                                <span className="text-error-400 font-medium">Recording in progress...</span>
                            </div>
                        )}

                        {/* Transcription Preview */}
                        {voiceAnalysis?.transcription && (
                            <div className="mb-4 p-4 bg-dark-800/50 rounded-xl">
                                <p className="text-sm text-dark-400 mb-1">Transcription:</p>
                                <p className="text-white">{voiceAnalysis.transcription}</p>
                            </div>
                        )}

                        {/* Text Input */}
                        <textarea
                            ref={textareaRef}
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            placeholder="Type your answer here or use the microphone..."
                            className="input min-h-[200px] resize-none mb-4"
                            disabled={isRecording || isPaused || isProcessing}
                        />

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Voice Button */}
                                {session?.voiceEnabled && (
                                    <button
                                        onClick={handleRecordToggle}
                                        disabled={isPaused || isProcessing}
                                        className={`p-3 rounded-xl transition-all ${isRecording
                                            ? 'bg-error-500 text-white animate-pulse'
                                            : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                                            }`}
                                    >
                                        {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                    </button>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={(!currentAnswer.trim() && !voiceAnalysis?.transcription) || isProcessing || isPaused}
                                className="btn-primary"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Submit Answer
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Paused Overlay */}
            {isPaused && (
                <div className="fixed inset-0 bg-dark-950/90 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center">
                        <Pause className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Interview Paused</h2>
                        <p className="text-dark-400 mb-6">Take your time. Click resume when ready.</p>
                        <button onClick={resumeInterview} className="btn-primary">
                            <Play className="w-5 h-5" />
                            Resume Interview
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
