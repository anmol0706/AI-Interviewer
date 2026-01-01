import { useEffect, useState } from 'react';
import { useDailyPracticeStore } from '../stores/dailyPracticeStore';
import { useAuthStore } from '../stores/authStore';

// Icons as SVG components
const FireIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.4 1.5-4.5 3-6.5s3-4.5 3-7.5c0 0 1 2 3 4s4 4 4 7.5c0 .5 0 1-.1 1.5.6-.4 1.1-.9 1.5-1.5 0 0 .6 2.5-.1 5-1.1 3.7-4.3 4.5-7.3 4.5z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TrophyIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
);

const categoryConfig = {
    communication: {
        title: 'Communication Skills',
        icon: '💬',
        gradient: 'from-blue-500 to-cyan-500',
        bgGradient: 'from-blue-500/10 to-cyan-500/10',
        borderColor: 'border-blue-500/30'
    },
    aptitude: {
        title: 'Aptitude',
        icon: '🧠',
        gradient: 'from-purple-500 to-pink-500',
        bgGradient: 'from-purple-500/10 to-pink-500/10',
        borderColor: 'border-purple-500/30'
    },
    generalKnowledge: {
        title: 'General Knowledge',
        icon: '🌍',
        gradient: 'from-amber-500 to-orange-500',
        bgGradient: 'from-amber-500/10 to-orange-500/10',
        borderColor: 'border-amber-500/30'
    }
};

function DailyPractice() {
    const { user } = useAuthStore();
    const {
        questions,
        progress,
        isCompleted,
        streak,
        streakActive,
        stats,
        leaderboard,
        isLoading,
        isSubmitting,
        error,
        currentCategory,
        currentQuestionIndex,
        setCurrentCategory,
        setCurrentQuestionIndex,
        fetchDailyQuestions,
        submitAnswer,
        fetchStats,
        fetchLeaderboard,
        getOverallProgress
    } = useDailyPracticeStore();

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [activeTab, setActiveTab] = useState('practice');
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [rewardStreak, setRewardStreak] = useState(0);

    useEffect(() => {
        fetchDailyQuestions();
        fetchStats();
        fetchLeaderboard();
    }, []);

    const handleAnswerSelect = (answerId) => {
        if (isSubmitting || showResult) return;
        setSelectedAnswer(answerId);
    };

    const handleSubmitAnswer = async () => {
        if (!selectedAnswer || isSubmitting) return;

        try {
            const result = await submitAnswer(currentCategory, currentQuestionIndex, selectedAnswer);
            setLastResult(result);
            setShowResult(true);

            // Check if user won a reward (10-day streak milestone)
            if (result.rewardGranted) {
                setRewardStreak(result.streak);
                setShowRewardModal(true);
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    };

    const handleNextQuestion = () => {
        // If all questions are completed, switch to stats tab
        if (isCompleted) {
            fetchStats(); // Refresh stats
            setActiveTab('stats');
            return;
        }

        const categoryQuestions = questions?.[currentCategory] || [];
        setShowResult(false);
        setSelectedAnswer(null);
        setLastResult(null);

        // Find next unanswered question in current category
        let nextIndex = currentQuestionIndex + 1;
        while (nextIndex < categoryQuestions.length && categoryQuestions[nextIndex]?.answered) {
            nextIndex++;
        }

        if (nextIndex < categoryQuestions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            // Move to next category
            const categories = Object.keys(categoryConfig);
            const currentIdx = categories.indexOf(currentCategory);
            for (let i = 1; i <= categories.length; i++) {
                const nextCat = categories[(currentIdx + i) % categories.length];
                const nextCatQuestions = questions?.[nextCat] || [];
                const unansweredIdx = nextCatQuestions.findIndex(q => !q.answered);
                if (unansweredIdx !== -1) {
                    setCurrentCategory(nextCat);
                    setCurrentQuestionIndex(unansweredIdx);
                    return;
                }
            }
        }
    };

    const handleCategoryChange = (category) => {
        setCurrentCategory(category);
        setCurrentQuestionIndex(0);
        setShowResult(false);
        setSelectedAnswer(null);
        setLastResult(null);
    };

    const currentQuestion = questions?.[currentCategory]?.[currentQuestionIndex];
    const overallProgress = getOverallProgress();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-dark-400 text-lg">Loading daily practice...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card p-8 text-center max-w-md">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
                    <p className="text-dark-400 mb-6">{error}</p>
                    <button
                        onClick={() => fetchDailyQuestions()}
                        className="btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
                                Daily Practice
                            </h1>
                            <p className="text-dark-400 mt-1">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        {/* Streak Badge */}
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl ${streakActive ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30'
                            : 'bg-dark-800/50 border border-dark-700'
                            }`}>
                            <div className={`${streakActive ? 'text-orange-500' : 'text-dark-500'}`}>
                                <FireIcon />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{streak}</div>
                                <div className="text-xs text-dark-400">Day Streak</div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6 glass-card p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-dark-300">Today's Progress</span>
                            <span className="text-white font-semibold">
                                {overallProgress.answered}/{overallProgress.total} Questions
                            </span>
                        </div>
                        <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                                style={{ width: `${(overallProgress.answered / overallProgress.total) * 100}%` }}
                            />
                        </div>
                        {isCompleted && (
                            <div className="mt-3 flex items-center gap-2 text-success-400">
                                <CheckIcon />
                                <span>All questions completed! Score: {overallProgress.correct}/{overallProgress.total}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { id: 'practice', label: 'Practice', icon: '📝' },
                        { id: 'stats', label: 'Statistics', icon: '📊' },
                        { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                : 'bg-dark-800/50 text-dark-400 border border-transparent hover:border-dark-600'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Practice Tab */}
                {activeTab === 'practice' && (
                    <div className="grid lg:grid-cols-4 gap-6">
                        {/* Categories Sidebar */}
                        <div className="lg:col-span-1 space-y-3">
                            {Object.entries(categoryConfig).map(([key, config]) => {
                                const catQuestions = questions?.[key] || [];
                                const answered = catQuestions.filter(q => q.answered).length;
                                const correct = catQuestions.filter(q => q.isCorrect).length;

                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleCategoryChange(key)}
                                        className={`w-full p-4 rounded-2xl border transition-all text-left ${currentCategory === key
                                            ? `bg-gradient-to-br ${config.bgGradient} ${config.borderColor}`
                                            : 'bg-dark-800/50 border-dark-700 hover:border-dark-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">{config.icon}</span>
                                            <span className="font-semibold text-white">{config.title}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-dark-400">
                                                {answered}/{catQuestions.length}
                                            </span>
                                            {answered === catQuestions.length && catQuestions.length > 0 && (
                                                <span className="text-success-400 text-sm">
                                                    {correct}/{answered} correct
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all`}
                                                style={{ width: `${(answered / catQuestions.length) * 100}%` }}
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Question Area */}
                        <div className="lg:col-span-3">
                            {currentQuestion ? (
                                <div className="glass-card p-6 sm:p-8">
                                    {/* Question Header */}
                                    <div className="flex items-start justify-between gap-4 mb-6">
                                        <div className={`px-3 py-1 rounded-full text-sm bg-gradient-to-r ${categoryConfig[currentCategory].bgGradient} ${categoryConfig[currentCategory].borderColor} border`}>
                                            {categoryConfig[currentCategory].title}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${currentQuestion.difficulty === 'easy' ? 'bg-success-500/20 text-success-400' :
                                            currentQuestion.difficulty === 'medium' ? 'bg-warning-500/20 text-warning-400' :
                                                'bg-error-500/20 text-error-400'
                                            }`}>
                                            {currentQuestion.difficulty?.charAt(0).toUpperCase() + currentQuestion.difficulty?.slice(1)}
                                        </div>
                                    </div>

                                    {/* Question Number */}
                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                        {(questions?.[currentCategory] || []).map((q, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setCurrentQuestionIndex(idx);
                                                    setShowResult(q.answered);
                                                    setSelectedAnswer(q.userAnswer);
                                                    if (q.answered) {
                                                        setLastResult({
                                                            isCorrect: q.isCorrect,
                                                            correctAnswer: q.correctAnswer,
                                                            explanation: q.explanation
                                                        });
                                                    } else {
                                                        setLastResult(null);
                                                    }
                                                }}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-all ${currentQuestionIndex === idx
                                                    ? 'bg-primary-500 text-white scale-110'
                                                    : q.answered
                                                        ? q.isCorrect
                                                            ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                                                            : 'bg-error-500/20 text-error-400 border border-error-500/30'
                                                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                                    }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Question Text */}
                                    <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6 leading-relaxed">
                                        {currentQuestion.questionText}
                                    </h2>

                                    {/* Options */}
                                    <div className="space-y-3 mb-6">
                                        {currentQuestion.options?.map((option) => {
                                            const isSelected = selectedAnswer === option.id;
                                            const isCorrect = showResult && option.id === lastResult?.correctAnswer;
                                            const isWrong = showResult && isSelected && !lastResult?.isCorrect;
                                            const isAnswered = currentQuestion.answered;

                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => !isAnswered && handleAnswerSelect(option.id)}
                                                    disabled={isAnswered || isSubmitting}
                                                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${isCorrect
                                                        ? 'bg-success-500/20 border-success-500 text-white'
                                                        : isWrong
                                                            ? 'bg-error-500/20 border-error-500 text-white'
                                                            : isSelected
                                                                ? 'bg-primary-500/20 border-primary-500 text-white'
                                                                : isAnswered
                                                                    ? 'bg-dark-800/50 border-dark-700 text-dark-400'
                                                                    : 'bg-dark-800/50 border-dark-700 text-dark-200 hover:border-dark-500 hover:bg-dark-700/50'
                                                        }`}
                                                >
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold flex-shrink-0 ${isCorrect
                                                        ? 'bg-success-500 text-white'
                                                        : isWrong
                                                            ? 'bg-error-500 text-white'
                                                            : isSelected
                                                                ? 'bg-primary-500 text-white'
                                                                : 'bg-dark-600 text-dark-300'
                                                        }`}>
                                                        {isCorrect ? <CheckIcon /> : isWrong ? <XIcon /> : option.id}
                                                    </span>
                                                    <span className="pt-1">{option.text}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Explanation (shown after answering) */}
                                    {showResult && lastResult?.explanation && (
                                        <div className={`p-4 rounded-xl mb-6 ${lastResult.isCorrect
                                            ? 'bg-success-500/10 border border-success-500/30'
                                            : 'bg-error-500/10 border border-error-500/30'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                {lastResult.isCorrect ? (
                                                    <span className="text-success-400 font-semibold flex items-center gap-2">
                                                        <CheckIcon /> Correct!
                                                    </span>
                                                ) : (
                                                    <span className="text-error-400 font-semibold flex items-center gap-2">
                                                        <XIcon /> Incorrect
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-dark-300">{lastResult.explanation}</p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-3">
                                        {!currentQuestion.answered && !showResult ? (
                                            <button
                                                onClick={handleSubmitAnswer}
                                                disabled={!selectedAnswer || isSubmitting}
                                                className="btn-primary disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleNextQuestion}
                                                className="btn-primary"
                                            >
                                                {isCompleted ? 'View Results' : 'Next Question →'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-card p-8 text-center">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        All questions completed!
                                    </h2>
                                    <p className="text-dark-400 mb-6">
                                        Great job! You've answered all questions for today.
                                    </p>
                                    <div className="text-4xl font-bold gradient-text">
                                        {overallProgress.correct}/{overallProgress.total}
                                    </div>
                                    <p className="text-dark-400 mt-2">Questions Correct</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats Tab */}
                {activeTab === 'stats' && stats && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Streak Card */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                                    <FireIcon />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">{stats.currentStreak}</div>
                                    <div className="text-dark-400 text-sm">Current Streak</div>
                                </div>
                            </div>
                            <div className="text-sm text-dark-500">
                                Longest: {stats.longestStreak} days
                            </div>
                        </div>

                        {/* Days Completed */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-success-500/20 to-emerald-500/20">
                                    <CheckIcon />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">{stats.totalDaysCompleted}</div>
                                    <div className="text-dark-400 text-sm">Days Completed</div>
                                </div>
                            </div>
                            <div className="text-sm text-dark-500">
                                Attempted: {stats.totalDaysAttempted} days
                            </div>
                        </div>

                        {/* Average Score */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
                                    <TrophyIcon />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">{stats.averageScore}%</div>
                                    <div className="text-dark-400 text-sm">Average Score</div>
                                </div>
                            </div>
                        </div>

                        {/* Category Performance */}
                        <div className="glass-card p-6 md:col-span-2 lg:col-span-1">
                            <h3 className="font-semibold text-white mb-4">Category Performance</h3>
                            <div className="space-y-3">
                                {Object.entries(stats.categoryPerformance || {}).map(([cat, perf]) => {
                                    const config = categoryConfig[cat];
                                    const percentage = perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0;
                                    return (
                                        <div key={cat}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-dark-400">{config?.title || cat}</span>
                                                <span className="text-white">{percentage}%</span>
                                            </div>
                                            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${config?.gradient || 'from-primary-500 to-secondary-500'} rounded-full`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent History */}
                        <div className="glass-card p-6 md:col-span-2 lg:col-span-4">
                            <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {(stats.recentHistory || []).map((day, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex-shrink-0 p-4 rounded-xl text-center min-w-[100px] ${day.isCompleted
                                            ? 'bg-success-500/10 border border-success-500/30'
                                            : 'bg-dark-800/50 border border-dark-700'
                                            }`}
                                    >
                                        <div className="text-xs text-dark-400 mb-1">
                                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className={`text-lg font-bold ${day.isCompleted ? 'text-success-400' : 'text-dark-500'}`}>
                                            {day.totalScore}/{day.maxScore}
                                        </div>
                                        {day.isCompleted && (
                                            <div className="text-xs text-orange-400 mt-1 flex items-center justify-center gap-1">
                                                <FireIcon /> {day.streak}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 border-b border-dark-700">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <TrophyIcon /> Today's Leaderboard
                            </h3>
                        </div>
                        {leaderboard.length > 0 ? (
                            <div className="divide-y divide-dark-700">
                                {leaderboard.map((entry, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 flex items-center gap-4 ${idx < 3 ? 'bg-gradient-to-r from-dark-800/50 to-transparent' : ''
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white' :
                                            idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-800' :
                                                idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                                                    'bg-dark-700 text-dark-400'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-white">
                                                {entry.firstName} {entry.lastName}
                                            </div>
                                            <div className="text-sm text-dark-400">
                                                Streak: {entry.streak} days
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold gradient-text">
                                                {entry.totalScore}/{entry.maxScore}
                                            </div>
                                            <div className="text-sm text-dark-400">
                                                {Math.round(entry.percentage)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-dark-400">
                                <div className="text-4xl mb-2">🏆</div>
                                <p>No one has completed today's practice yet.</p>
                                <p className="text-sm mt-1">Be the first to finish!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Reward Celebration Modal */}
            {showRewardModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 rounded-3xl p-8 max-w-md w-full text-center border border-primary-500/30 shadow-2xl shadow-primary-500/20 animate-bounce-in">
                        {/* Confetti Effect */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 left-1/4 w-3 h-3 bg-yellow-500 rounded-full animate-confetti-1" />
                            <div className="absolute top-0 left-1/2 w-2 h-2 bg-pink-500 rounded-full animate-confetti-2" />
                            <div className="absolute top-0 right-1/4 w-3 h-3 bg-blue-500 rounded-full animate-confetti-3" />
                        </div>

                        {/* Trophy Icon */}
                        <div className="text-8xl mb-4 animate-pulse">🎉</div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold gradient-text mb-2">
                            Congratulations!
                        </h2>

                        {/* Subtitle */}
                        <p className="text-xl text-white mb-4">
                            You reached a <span className="text-orange-500 font-bold">{rewardStreak}-day</span> streak!
                        </p>

                        {/* Reward Box */}
                        <div className="bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl p-6 mb-6 border border-primary-500/30">
                            <div className="text-5xl mb-3">🎁</div>
                            <p className="text-dark-300 text-sm mb-2">You've earned:</p>
                            <p className="text-2xl font-bold text-white">
                                +1 Free Interview
                            </p>
                            <p className="text-primary-400 text-sm mt-1">
                                Added to your account!
                            </p>
                        </div>

                        {/* Next Milestone */}
                        <p className="text-dark-400 text-sm mb-6">
                            Next reward at <span className="text-orange-400 font-semibold">{rewardStreak + 10}-day</span> streak!
                        </p>

                        {/* Close Button */}
                        <button
                            onClick={() => setShowRewardModal(false)}
                            className="btn-primary w-full py-3 text-lg"
                        >
                            Awesome! 🚀
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DailyPractice;
