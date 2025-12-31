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
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-dark-400">Generating your report...</p>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-error-400 mb-4">Failed to load report</p>
                    <Link to="/dashboard" className="btn-primary">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const { session, overallScores, analytics, responses, summary } = report;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/dashboard" className="text-dark-400 hover:text-white flex items-center gap-2 mb-2 text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Interview Report</h1>
                    <p className="text-dark-400 capitalize">
                        {session?.interviewType} Interview • {new Date(session?.completedAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-ghost">
                        <Share2 className="w-5 h-5" />
                        Share
                    </button>
                    <button className="btn-secondary">
                        <Download className="w-5 h-5" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Overall Score Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-8 bg-gradient-to-br ${getScoreBg(overallScores?.overall || 0)}`}
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <p className="text-dark-400 mb-2">Overall Score</p>
                        <div className={`text-6xl font-bold ${getScoreColor(overallScores?.overall || 0)}`}>
                            {overallScores?.overall || 0}%
                        </div>
                        <p className="text-dark-300 mt-2">
                            {overallScores?.overall >= 85 ? 'Excellent Performance!' :
                                overallScores?.overall >= 70 ? 'Good Job!' :
                                    overallScores?.overall >= 55 ? 'Room for Improvement' :
                                        'Keep Practicing'}
                        </p>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-5 gap-6">
                        {[
                            { key: 'correctness', icon: Target, label: 'Correctness' },
                            { key: 'reasoning', icon: Brain, label: 'Reasoning' },
                            { key: 'communication', icon: MessageSquare, label: 'Communication' },
                            { key: 'structure', icon: Layers, label: 'Structure' },
                            { key: 'confidence', icon: TrendingUp, label: 'Confidence' }
                        ].map(({ key, icon: Icon, label }) => (
                            <div key={key} className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-dark-800/50 flex items-center justify-center mx-auto mb-2">
                                    <Icon className={`w-6 h-6 ${getScoreColor(overallScores?.[key] || 0)}`} />
                                </div>
                                <div className={`text-xl font-bold ${getScoreColor(overallScores?.[key] || 0)}`}>
                                    {overallScores?.[key] || 0}%
                                </div>
                                <div className="text-dark-400 text-xs">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Clock, label: 'Duration', value: `${Math.floor((session?.duration || 0) / 60)} min` },
                    { icon: BarChart3, label: 'Questions', value: `${report.progress?.questionsAnswered || 0} answered` },
                    { icon: Target, label: 'Difficulty', value: session?.difficulty?.initial || 'Medium' },
                    { icon: Award, label: 'Performance', value: analytics?.performanceTrend || 'Stable' }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-4 text-center"
                    >
                        <stat.icon className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                        <p className="text-lg font-semibold text-white capitalize">{stat.value}</p>
                        <p className="text-dark-400 text-sm">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-success-400" />
                        Your Strengths
                    </h3>
                    {analytics?.strengthAreas?.length > 0 ? (
                        <ul className="space-y-3">
                            {analytics.strengthAreas.map((strength, i) => (
                                <li key={i} className="flex items-start gap-3 text-dark-300">
                                    <div className="w-6 h-6 rounded-full bg-success-500/20 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-4 h-4 text-success-400" />
                                    </div>
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-dark-400">Complete more interviews to see patterns</p>
                    )}
                </motion.div>

                {/* Weaknesses */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-warning-400" />
                        Areas to Improve
                    </h3>
                    {analytics?.weaknessAreas?.length > 0 ? (
                        <ul className="space-y-3">
                            {analytics.weaknessAreas.map((weakness, i) => (
                                <li key={i} className="flex items-start gap-3 text-dark-300">
                                    <div className="w-6 h-6 rounded-full bg-warning-500/20 flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-4 h-4 text-warning-400" />
                                    </div>
                                    {weakness}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-dark-400">Great job! No major weaknesses identified</p>
                    )}
                </motion.div>
            </div>

            {/* AI Improvement Plan */}
            {analytics?.improvementPlan && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary-400" />
                        AI-Generated Improvement Plan
                    </h3>

                    {analytics.improvementPlan.summary && (
                        <p className="text-dark-300 mb-6">{analytics.improvementPlan.summary}</p>
                    )}

                    {analytics.improvementPlan.focusAreas?.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-dark-400 mb-3">Focus Areas</h4>
                            <div className="flex flex-wrap gap-2">
                                {analytics.improvementPlan.focusAreas.map((area, i) => (
                                    <span key={i} className="badge-primary">
                                        {area}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {analytics.improvementPlan.recommendedPractice?.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-dark-400 mb-3">Recommended Practice</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                {analytics.improvementPlan.recommendedPractice.map((practice, i) => (
                                    <div key={i} className="p-4 bg-dark-800/50 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-white">{practice.topic}</span>
                                            <span className={`badge text-xs ${practice.priority === 'high' ? 'badge-error' :
                                                    practice.priority === 'medium' ? 'badge-warning' :
                                                        'badge-secondary'
                                                }`}>
                                                {practice.priority}
                                            </span>
                                        </div>
                                        {practice.suggestedQuestions?.length > 0 && (
                                            <ul className="text-sm text-dark-400 space-y-1">
                                                {practice.suggestedQuestions.slice(0, 3).map((q, j) => (
                                                    <li key={j}>• {q}</li>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
            >
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary-400" />
                    Question Breakdown
                </h3>

                <div className="space-y-4">
                    {responses?.map((response, index) => (
                        <div key={index} className="p-4 bg-dark-800/50 rounded-xl">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm text-primary-400">Q{response.questionIndex + 1}</span>
                                        <span className="badge-secondary text-xs capitalize">{response.difficulty}</span>
                                    </div>
                                    <p className="text-white mb-2">{response.question}</p>
                                    {response.answer && (
                                        <p className="text-dark-400 text-sm">{response.answer}</p>
                                    )}
                                </div>
                                <div className={`text-2xl font-bold ${getScoreColor(response.scores?.overall?.score || response.scores?.overall || 0)}`}>
                                    {response.scores?.overall?.score || response.scores?.overall || 0}%
                                </div>
                            </div>

                            {(response.strengths?.length > 0 || response.weaknesses?.length > 0) && (
                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-dark-700">
                                    {response.strengths?.map((s, i) => (
                                        <span key={i} className="px-2 py-1 bg-success-500/10 text-success-400 rounded text-xs">
                                            ✓ {s}
                                        </span>
                                    ))}
                                    {response.weaknesses?.map((w, i) => (
                                        <span key={i} className="px-2 py-1 bg-warning-500/10 text-warning-400 rounded text-xs">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/interview/new" className="btn-primary">
                    Start New Interview
                    <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/analytics" className="btn-secondary">
                    View Analytics
                </Link>
            </div>
        </div>
    );
}
