import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { interviewService } from '../../services/interviewService';
import {
    ArrowLeft,
    Download,
    Share2,
    Target,
    Brain,
    MessageSquare,
    Layers,
    TrendingUp,
    Clock,
    Award,
    CheckCircle,
    AlertCircle,
    Lightbulb,
    BookOpen,
    ArrowRight,
    BarChart3
} from 'lucide-react';

export default function InterviewReport() {
    const { sessionId } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['interview-report', sessionId],
        queryFn: () => interviewService.getReport(sessionId)
    });

    const report = data?.data;

    const getScoreColor = (score) => {
        if (score >= 85) return 'text-success-400';
        if (score >= 70) return 'text-primary-400';
        if (score >= 55) return 'text-warning-400';
        return 'text-error-400';
    };

    const getScoreBg = (score) => {
        if (score >= 85) return 'from-success-500/20 to-success-500/5';
        if (score >= 70) return 'from-primary-500/20 to-primary-500/5';
        if (score >= 55) return 'from-warning-500/20 to-warning-500/5';
        return 'from-error-500/20 to-error-500/5';
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 lg:w-12 lg:h-12 border-3 lg:border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 lg:mb-4" />
                    <p className="text-dark-400 text-xs sm:text-sm lg:text-base">Generating report...</p>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-error-400 text-xs sm:text-sm mb-3">Failed to load report</p>
                    <Link to="/dashboard" className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-all">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const { session, overallScores, analytics, responses, summary } = report;

    return (
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="text-center sm:text-left">
                    <Link to="/dashboard" className="text-dark-500 hover:text-white inline-flex items-center gap-1 mb-1 lg:mb-2 text-[10px] sm:text-xs lg:text-sm">
                        <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-white">Interview Report</h1>
                    <p className="text-dark-400 capitalize text-[10px] sm:text-xs lg:text-sm">
                        {session?.interviewType} Interview • {new Date(session?.completedAt).toLocaleDateString()}
                    </p>
                </div>
                {/* Action buttons */}
                <div className="flex items-center justify-center sm:justify-start gap-2 lg:gap-3">
                    <button className="p-2 lg:p-3 rounded-lg lg:rounded-xl bg-dark-800/50 text-dark-400 hover:bg-dark-700 transition-colors">
                        <Share2 className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                    <button className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl bg-dark-800/80 text-white text-[10px] sm:text-xs lg:text-sm font-medium flex items-center gap-1.5 lg:gap-2 hover:bg-dark-700 transition-colors">
                        <Download className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span className="hidden sm:inline">Download</span> PDF
                    </button>
                </div>
            </div>

            {/* Overall Score Card */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-dark-900/80 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-dark-800/50 p-4 sm:p-5 lg:p-8 bg-gradient-to-br ${getScoreBg(overallScores?.overall || 0)}`}
            >
                <div className="text-center mb-4 sm:mb-5 lg:mb-8">
                    <p className="text-dark-500 text-[10px] sm:text-xs lg:text-sm mb-1">Overall Score</p>
                    <div className={`text-3xl sm:text-4xl lg:text-6xl font-bold ${getScoreColor(overallScores?.overall || 0)}`}>
                        {overallScores?.overall || 0}%
                    </div>
                    <p className="text-dark-400 text-xs sm:text-sm lg:text-base mt-1 lg:mt-2">
                        {overallScores?.overall >= 85 ? 'Excellent!' :
                            overallScores?.overall >= 70 ? 'Good Job!' :
                                overallScores?.overall >= 55 ? 'Keep Going' :
                                    'Keep Practicing'}
                    </p>
                </div>

                {/* Score Breakdown - 5 cols grid */}
                <div className="grid grid-cols-5 gap-2 sm:gap-3 lg:gap-6">
                    {[
                        { key: 'correctness', icon: Target, label: 'Correctness' },
                        { key: 'reasoning', icon: Brain, label: 'Reasoning' },
                        { key: 'communication', icon: MessageSquare, label: 'Comm.' },
                        { key: 'structure', icon: Layers, label: 'Structure' },
                        { key: 'confidence', icon: TrendingUp, label: 'Confidence' }
                    ].map(({ key, icon: Icon, label }) => (
                        <div key={key} className="text-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 rounded-lg lg:rounded-xl bg-dark-800/50 flex items-center justify-center mx-auto mb-1 lg:mb-2">
                                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 ${getScoreColor(overallScores?.[key] || 0)}`} />
                            </div>
                            <div className={`text-xs sm:text-sm lg:text-lg font-bold ${getScoreColor(overallScores?.[key] || 0)}`}>
                                {overallScores?.[key] || 0}%
                            </div>
                            <div className="text-dark-500 text-[8px] sm:text-[10px] lg:text-xs truncate">{label}</div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {[
                    { icon: Clock, label: 'Duration', value: `${Math.floor((session?.duration || 0) / 60)}m` },
                    { icon: BarChart3, label: 'Questions', value: `${report.progress?.questionsAnswered || 0}` },
                    { icon: Target, label: 'Level', value: session?.difficulty?.initial || 'Med' },
                    { icon: Award, label: 'Trend', value: analytics?.performanceTrend || '-' }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-dark-900/60 border border-dark-800/50 rounded-lg lg:rounded-xl p-2.5 sm:p-3 lg:p-4 text-center"
                    >
                        <stat.icon className="w-4 h-4 lg:w-6 lg:h-6 text-primary-400 mx-auto mb-1 lg:mb-2" />
                        <p className="text-xs sm:text-sm lg:text-lg font-semibold text-white capitalize truncate">{stat.value}</p>
                        <p className="text-dark-500 text-[9px] sm:text-xs lg:text-sm">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2">
                {/* Strengths */}
                <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-dark-900/60 border border-dark-800/50 rounded-lg p-3 sm:p-4"
                >
                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-success-400" />
                        Strengths
                    </h3>
                    {analytics?.strengthAreas?.length > 0 ? (
                        <ul className="space-y-1.5">
                            {analytics.strengthAreas.slice(0, 3).map((strength, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-dark-400 text-[10px] sm:text-xs leading-relaxed">
                                    <CheckCircle className="w-3 h-3 text-success-400 flex-shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-dark-500 text-[10px] sm:text-xs">Complete interviews to see</p>
                    )}
                </motion.div>

                {/* Weaknesses */}
                <motion.div
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-dark-900/60 border border-dark-800/50 rounded-lg p-3 sm:p-4"
                >
                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-warning-400" />
                        To Improve
                    </h3>
                    {analytics?.weaknessAreas?.length > 0 ? (
                        <ul className="space-y-1.5">
                            {analytics.weaknessAreas.slice(0, 3).map((weakness, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-dark-400 text-[10px] sm:text-xs leading-relaxed">
                                    <AlertCircle className="w-3 h-3 text-warning-400 flex-shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{weakness}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-dark-500 text-[10px] sm:text-xs">Great job!</p>
                    )}
                </motion.div>
            </div>

            {/* AI Improvement Plan */}
            {analytics?.improvementPlan && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-900/60 border border-dark-800/50 rounded-lg p-3 sm:p-4"
                >
                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-primary-400" />
                        Improvement Plan
                    </h3>

                    {analytics.improvementPlan.summary && (
                        <p className="text-dark-400 text-[10px] sm:text-xs mb-3 leading-relaxed line-clamp-3">{analytics.improvementPlan.summary}</p>
                    )}

                    {analytics.improvementPlan.focusAreas?.length > 0 && (
                        <div className="mb-3">
                            <h4 className="text-[10px] sm:text-xs font-medium text-dark-500 mb-1.5">Focus Areas</h4>
                            <div className="flex flex-wrap gap-1">
                                {analytics.improvementPlan.focusAreas.slice(0, 4).map((area, i) => (
                                    <span key={i} className="px-1.5 py-0.5 rounded bg-primary-500/15 text-primary-400 text-[9px] sm:text-[10px]">
                                        {area}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {analytics.improvementPlan.recommendedPractice?.length > 0 && (
                        <div>
                            <h4 className="text-[10px] sm:text-xs font-medium text-dark-500 mb-1.5">Practice</h4>
                            <div className="space-y-1.5">
                                {analytics.improvementPlan.recommendedPractice.slice(0, 2).map((practice, i) => (
                                    <div key={i} className="p-2 bg-dark-800/50 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-white text-[10px] sm:text-xs">{practice.topic}</span>
                                            <span className={`px-1 py-0.5 rounded text-[8px] ${practice.priority === 'high' ? 'bg-error-500/15 text-error-400' :
                                                practice.priority === 'medium' ? 'bg-warning-500/15 text-warning-400' :
                                                    'bg-dark-700 text-dark-400'
                                                }`}>
                                                {practice.priority}
                                            </span>
                                        </div>
                                        {practice.suggestedQuestions?.length > 0 && (
                                            <ul className="text-[9px] sm:text-[10px] text-dark-500 space-y-0.5">
                                                {practice.suggestedQuestions.slice(0, 2).map((q, j) => (
                                                    <li key={j} className="truncate">• {q}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Question-by-Question Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-900/60 border border-dark-800/50 rounded-lg p-3 sm:p-4"
            >
                <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary-400" />
                    Questions
                </h3>

                <div className="space-y-2">
                    {responses?.map((response, index) => (
                        <div key={index} className="p-2 sm:p-2.5 bg-dark-800/50 rounded-lg">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[10px] text-primary-400 font-medium">Q{response.questionIndex + 1}</span>
                                        <span className="px-1 py-0.5 rounded bg-dark-700 text-dark-400 text-[8px] capitalize">{response.difficulty}</span>
                                    </div>
                                    <p className="text-white text-[10px] sm:text-xs line-clamp-2">{response.question}</p>
                                </div>
                                <div className={`text-sm sm:text-base font-bold flex-shrink-0 ${getScoreColor(response.scores?.overall?.score || response.scores?.overall || 0)}`}>
                                    {response.scores?.overall?.score || response.scores?.overall || 0}%
                                </div>
                            </div>

                            {(response.strengths?.length > 0 || response.weaknesses?.length > 0) && (
                                <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-dark-700/50">
                                    {response.strengths?.slice(0, 2).map((s, i) => (
                                        <span key={i} className="px-1 py-0.5 bg-success-500/10 text-success-400 rounded text-[8px]">
                                            ✓ {s}
                                        </span>
                                    ))}
                                    {response.weaknesses?.slice(0, 2).map((w, i) => (
                                        <span key={i} className="px-1 py-0.5 bg-warning-500/10 text-warning-400 rounded text-[8px]">
                                            ! {w}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Link to="/interview/new" className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-primary-500/20 transition-all">
                    New Interview
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link to="/analytics" className="bg-dark-800/80 hover:bg-dark-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-all">
                    Analytics
                </Link>
            </div>
        </div>
    );
}
