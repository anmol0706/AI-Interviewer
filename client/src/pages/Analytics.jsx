import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/interviewService';
import { TrendingUp, Target, Award, Calendar, BarChart3, Lightbulb } from 'lucide-react';

export default function Analytics() {
    const { data: performanceData, isLoading } = useQuery({
        queryKey: ['performance-analytics'],
        queryFn: () => analyticsService.getPerformance('30days')
    });

    const { data: strengthsData } = useQuery({
        queryKey: ['strengths-weaknesses'],
        queryFn: analyticsService.getStrengthsWeaknesses
    });

    const performance = performanceData?.data;
    const strengths = strengthsData?.data;

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-success-400';
        if (score >= 60) return 'text-primary-400';
        return 'text-warning-400';
    };

    if (isLoading) {
        return <div className="h-48 sm:h-64 skeleton rounded-xl" />;
    }

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-white mb-0.5 lg:mb-2">Analytics</h1>
                <p className="text-dark-400 text-xs sm:text-sm lg:text-base">Track your progress and identify areas for improvement</p>
            </div>

            {/* Stats Grid - 4 columns on all screens */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {[
                    { icon: Calendar, label: 'Interviews', value: performance?.totalInterviews || 0 },
                    { icon: Target, label: 'Avg Score', value: `${performance?.averageScore || 0}%` },
                    { icon: TrendingUp, label: 'Improvement', value: `${performance?.improvementRate || 0}%` },
                    { icon: Award, label: 'Best', value: performance?.bestPerformingCategory || 'N/A' }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-dark-900/60 border border-dark-800/50 rounded-lg lg:rounded-2xl p-2.5 sm:p-3 lg:p-6 text-center"
                    >
                        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-8 lg:h-8 text-primary-400 mx-auto mb-1 lg:mb-3" />
                        <p className="text-dark-500 text-[9px] sm:text-xs lg:text-sm">{stat.label}</p>
                        <p className="text-xs sm:text-sm lg:text-2xl font-bold text-white capitalize truncate">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Skill Breakdown */}
            {strengths?.skillAverages && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-900/60 border border-dark-800/50 rounded-lg lg:rounded-2xl p-3 sm:p-4 lg:p-6"
                >
                    <h2 className="text-xs sm:text-sm lg:text-xl font-semibold text-white mb-3 sm:mb-4 lg:mb-6 flex items-center gap-1.5 lg:gap-2">
                        <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-primary-400" />
                        Skill Breakdown
                    </h2>
                    <div className="space-y-2.5 sm:space-y-3 lg:space-y-4">
                        {Object.entries(strengths.skillAverages).map(([skill, score]) => (
                            <div key={skill}>
                                <div className="flex justify-between text-[10px] sm:text-xs lg:text-sm mb-1">
                                    <span className="text-dark-400 capitalize">{skill}</span>
                                    <span className={`font-medium ${getScoreColor(score)}`}>{score}%</span>
                                </div>
                                <div className="h-1.5 sm:h-2 lg:h-3 bg-dark-800/50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${score}%` }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className={`h-full rounded-full ${score >= 80 ? 'bg-success-500' : score >= 60 ? 'bg-primary-500' : 'bg-warning-500'}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Empty state for no data */}
            {!strengths?.skillAverages && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-900/60 border border-dark-800/50 rounded-lg lg:rounded-2xl p-4 sm:p-6 lg:p-8 text-center"
                >
                    <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-primary-400 mx-auto mb-2 lg:mb-4" />
                    <h3 className="text-xs sm:text-sm lg:text-lg font-medium text-white mb-1 lg:mb-2">No data yet</h3>
                    <p className="text-dark-500 text-[10px] sm:text-xs lg:text-sm">Complete interviews to see your skill breakdown</p>
                </motion.div>
            )}
        </div>
    );
}
