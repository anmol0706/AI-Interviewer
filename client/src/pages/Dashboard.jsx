import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { analyticsService } from '../services/interviewService';
import {
    MessageSquarePlus,
    TrendingUp,
    Clock,
    Award,
    Target,
    ArrowRight,
    Calendar,
    Flame,
    BarChart3,
    Sparkles
} from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuthStore();

    const { data: analytics, isLoading } = useQuery({
        queryKey: ['dashboard-analytics'],
        queryFn: analyticsService.getDashboard
    });

    const dashboardData = analytics?.data;

    const getScoreColor = (score) => {
        if (score >= 85) return 'text-success-400';
        if (score >= 70) return 'text-primary-400';
        if (score >= 55) return 'text-warning-400';
        return 'text-error-400';
    };

    const getPerformanceBadge = (level) => {
        const badges = {
            excellent: { text: 'Excellent', class: 'badge-success' },
            good: { text: 'Good', class: 'badge-primary' },
            average: { text: 'Average', class: 'badge-warning' },
            'needs-improvement': { text: 'Needs Work', class: 'badge-error' }
        };
        return badges[level] || badges.average;
    };

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {user?.firstName}! 👋
                    </h1>
                    <p className="text-dark-400">
                        Ready to practice and improve your interview skills?
                    </p>
                </div>
                <Link to="/interview/new" className="btn-primary">
                    <MessageSquarePlus className="w-5 h-5" />
                    Start New Interview
                </Link>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        icon: Clock,
                        label: 'Total Interviews',
                        value: dashboardData?.overview?.totalInterviews || 0,
                        color: 'from-blue-500 to-cyan-500'
                    },
                    {
                        icon: Target,
                        label: 'Average Score',
                        value: `${dashboardData?.overview?.averageScore || 0}%`,
                        color: 'from-green-500 to-emerald-500'
                    },
                    {
                        icon: Flame,
                        label: 'Current Streak',
                        value: `${dashboardData?.overview?.currentStreak || 0} days`,
                        color: 'from-orange-500 to-red-500'
                    },
                    {
                        icon: Award,
                        label: 'Performance',
                        value: dashboardData?.performanceLevel
                            ? getPerformanceBadge(dashboardData.performanceLevel).text
                            : 'N/A',
                        color: 'from-purple-500 to-pink-500'
                    }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6"
                    >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-dark-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary-400" />
                        Quick Start
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { type: 'technical', label: 'Technical', color: 'from-blue-500 to-cyan-500' },
                            { type: 'behavioral', label: 'Behavioral', color: 'from-purple-500 to-pink-500' },
                            { type: 'system-design', label: 'System Design', color: 'from-orange-500 to-red-500' },
                            { type: 'hr', label: 'HR', color: 'from-green-500 to-emerald-500' }
                        ].map((interview) => (
                            <Link
                                key={interview.type}
                                to={`/interview/new?type=${interview.type}`}
                                className={`p-4 rounded-xl bg-gradient-to-br ${interview.color} text-white font-medium text-center hover:opacity-90 transition-opacity`}
                            >
                                {interview.label}
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Interviews */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary-400" />
                            Recent Interviews
                        </h2>
                        <Link to="/history" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 skeleton rounded-xl" />
                            ))}
                        </div>
                    ) : dashboardData?.recentInterviews?.length > 0 ? (
                        <div className="space-y-3">
                            {dashboardData.recentInterviews.slice(0, 5).map((interview) => (
                                <Link
                                    key={interview.sessionId}
                                    to={`/interview/${interview.sessionId}/report`}
                                    className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium capitalize">
                                                {interview.type} Interview
                                            </p>
                                            <p className="text-dark-400 text-sm">
                                                {new Date(interview.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-bold ${getScoreColor(interview.score)}`}>
                                            {interview.score}%
                                        </p>
                                        <p className="text-dark-400 text-xs capitalize">{interview.difficulty}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-dark-400 mb-4">No interviews yet</p>
                            <Link to="/interview/new" className="btn-primary">
                                Start Your First Interview
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Skill Breakdown */}
            {dashboardData?.skillRadar?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-400" />
                        Skill Breakdown
                    </h2>
                    <div className="grid md:grid-cols-5 gap-6">
                        {dashboardData.skillRadar.map((skill, index) => (
                            <div key={skill.skill} className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-3">
                                    <svg className="w-24 h-24 transform -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-dark-700"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={`${2 * Math.PI * 40}`}
                                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - skill.score / 100)}`}
                                            strokeLinecap="round"
                                            className={
                                                skill.score >= 80 ? 'text-success-500' :
                                                    skill.score >= 60 ? 'text-primary-500' :
                                                        'text-warning-500'
                                            }
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xl font-bold text-white">{skill.score}%</span>
                                    </div>
                                </div>
                                <p className="text-dark-300 font-medium">{skill.skill}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Subscription Banner for Free Users */}
            {user?.subscription?.plan === 'free' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-primary-500/30"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Unlock Unlimited Practice
                            </h3>
                            <p className="text-dark-300">
                                You have {user.subscription.interviewsRemaining || 0} free interviews remaining.
                                Upgrade to get unlimited access and advanced analytics.
                            </p>
                        </div>
                        <button className="btn-primary whitespace-nowrap">
                            Upgrade Now
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
