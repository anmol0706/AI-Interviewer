import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useDailyPracticeStore } from '../stores/dailyPracticeStore';
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
    Sparkles,
    CheckCircle2
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
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="text-center sm:text-left">
                    <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-white mb-0.5 lg:mb-2">
                        Welcome back, {user?.firstName}! 👋
                    </h1>
                    <p className="text-dark-400 text-xs sm:text-sm lg:text-base">
                        Ready to practice and improve your interview skills?
                    </p>
                </div>
                <Link to="/interview/new" className="bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm lg:text-base font-medium px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg inline-flex items-center justify-center gap-1.5 lg:gap-2 shadow-lg shadow-primary-500/20 transition-all">
                    <MessageSquarePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    New Interview
                </Link>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {[
                    {
                        icon: Clock,
                        label: 'Interviews',
                        value: dashboardData?.overview?.totalInterviews || 0,
                        color: 'from-blue-500 to-cyan-500'
                    },
                    {
                        icon: Target,
                        label: 'Avg Score',
                        value: `${dashboardData?.overview?.averageScore || 0}%`,
                        color: 'from-green-500 to-emerald-500'
                    },
                    {
                        icon: Flame,
                        label: 'Streak',
                        value: `${dashboardData?.overview?.currentStreak || 0}d`,
                        color: 'from-orange-500 to-red-500'
                    },
                    {
                        icon: Award,
                        label: 'Level',
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
                        className="bg-dark-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-2.5 sm:p-4 lg:p-6 border border-dark-800/50"
                    >
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-1.5 sm:mb-2 lg:mb-3`}>
                            <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <p className="text-dark-500 text-[9px] sm:text-xs lg:text-sm mb-0.5">{stat.label}</p>
                        <p className="text-sm sm:text-lg lg:text-2xl font-bold text-white truncate">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Daily Practice Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-orange-500/10 via-red-500/5 to-purple-500/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-orange-500/20"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white mb-1">Daily Practice</h3>
                            <p className="text-dark-400 text-xs sm:text-sm">
                                Complete today's questions to maintain your streak!
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/daily-practice"
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white text-sm font-medium px-5 py-2.5 rounded-xl inline-flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Start Practice
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid gap-3 sm:gap-4 lg:gap-6 lg:grid-cols-3">
                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-dark-900/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-dark-800/50"
                >
                    <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-2.5 sm:mb-3 lg:mb-4 flex items-center gap-1.5 lg:gap-2">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-primary-400" />
                        Quick Start
                    </h2>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 lg:gap-3">
                        {[
                            { type: 'technical', label: 'Technical', color: 'from-blue-500 to-cyan-500' },
                            { type: 'behavioral', label: 'Behavioral', color: 'from-purple-500 to-pink-500' },
                            { type: 'system-design', label: 'System', color: 'from-orange-500 to-red-500' },
                            { type: 'hr', label: 'HR', color: 'from-green-500 to-emerald-500' }
                        ].map((interview) => (
                            <Link
                                key={interview.type}
                                to={`/interview/new?type=${interview.type}`}
                                className={`p-2 sm:p-3 lg:p-4 rounded-lg lg:rounded-xl bg-gradient-to-br ${interview.color} text-white font-medium text-center text-[10px] sm:text-xs lg:text-sm hover:opacity-90 active:opacity-80 transition-opacity`}
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
                    className="bg-dark-900/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-dark-800/50 lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-2.5 sm:mb-3 lg:mb-4">
                        <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-white flex items-center gap-1.5 lg:gap-2">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-primary-400" />
                            Recent Interviews
                        </h2>
                        <Link to="/history" className="text-primary-400 hover:text-primary-300 text-[10px] sm:text-xs lg:text-sm flex items-center gap-0.5">
                            View All <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-12 skeleton rounded-lg" />
                            ))}
                        </div>
                    ) : dashboardData?.recentInterviews?.length > 0 ? (
                        <div className="space-y-1.5 sm:space-y-2">
                            {dashboardData.recentInterviews.slice(0, 5).map((interview) => (
                                <Link
                                    key={interview.sessionId}
                                    to={`/interview/${interview.sessionId}/report`}
                                    className="flex items-center justify-between p-2 sm:p-3 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-colors"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-500/15 flex items-center justify-center">
                                            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-xs sm:text-sm capitalize">
                                                {interview.type}
                                            </p>
                                            <p className="text-dark-500 text-[10px] sm:text-xs">
                                                {new Date(interview.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm sm:text-base font-bold ${getScoreColor(interview.score)}`}>
                                            {interview.score}%
                                        </p>
                                        <p className="text-dark-500 text-[9px] sm:text-xs capitalize">{interview.difficulty}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 sm:py-6">
                            <p className="text-dark-400 text-xs sm:text-sm mb-2 sm:mb-3">No interviews yet</p>
                            <Link to="/interview/new" className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all">
                                Start First Interview
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Skill Breakdown - 5 columns on all screens */}
            {dashboardData?.skillRadar?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-900/60 border border-dark-800/50 rounded-lg lg:rounded-2xl p-3 sm:p-4 lg:p-6"
                >
                    <h2 className="text-xs sm:text-sm lg:text-lg font-semibold text-white mb-3 sm:mb-4 lg:mb-6 flex items-center gap-1.5 lg:gap-2">
                        <TrendingUp className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-primary-400" />
                        Skill Breakdown
                    </h2>
                    {/* 5 columns on all screens */}
                    <div className="grid grid-cols-5 gap-2 sm:gap-3 lg:gap-6">
                        {dashboardData.skillRadar.map((skill, index) => (
                            <div key={skill.skill} className="text-center">
                                {/* Responsive circle */}
                                <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-24 lg:h-24 mx-auto mb-1 lg:mb-3">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="50%"
                                            cy="50%"
                                            r="42%"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            className="text-dark-700 lg:stroke-[8]"
                                        />
                                        <circle
                                            cx="50%"
                                            cy="50%"
                                            r="42%"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            strokeDasharray={`${2 * Math.PI * 35}`}
                                            strokeDashoffset={`${2 * Math.PI * 35 * (1 - skill.score / 100)}`}
                                            strokeLinecap="round"
                                            className={`lg:stroke-[8] ${skill.score >= 80 ? 'text-success-500' :
                                                skill.score >= 60 ? 'text-primary-500' :
                                                    'text-warning-500'
                                                }`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[9px] sm:text-xs lg:text-xl font-bold text-white">{skill.score}%</span>
                                    </div>
                                </div>
                                <p className="text-dark-500 font-medium text-[8px] sm:text-[10px] lg:text-sm truncate">{skill.skill}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Subscription Banner for Free Users */}
            {user?.subscription?.plan === 'free' && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/30 rounded-lg p-3 sm:p-4"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-white mb-0.5">
                                Unlock Unlimited
                            </h3>
                            <p className="text-dark-400 text-[10px] sm:text-xs">
                                {user.subscription.interviewsRemaining || 0} interviews left
                            </p>
                        </div>
                        <button className="bg-primary-500 hover:bg-primary-600 text-white text-[10px] sm:text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg shadow-primary-500/20 transition-all whitespace-nowrap">
                            Upgrade
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
