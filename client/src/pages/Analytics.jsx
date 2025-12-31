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
        return <div className="h-96 skeleton rounded-2xl" />;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
                <p className="text-dark-400">Track your progress and identify areas for improvement</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
                {[
                    { icon: Calendar, label: 'Interviews', value: performance?.totalInterviews || 0 },
                    { icon: Target, label: 'Avg Score', value: `${performance?.averageScore || 0}%` },
                    { icon: TrendingUp, label: 'Improvement', value: `${performance?.improvementRate || 0}%` },
                    { icon: Award, label: 'Best Category', value: performance?.bestPerformingCategory || 'N/A' }
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                        <stat.icon className="w-6 h-6 text-primary-400 mb-2" />
                        <p className="text-dark-400 text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold text-white capitalize">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {strengths?.skillAverages && (
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary-400" />
                        Skill Breakdown
                    </h2>
                    <div className="space-y-4">
                        {Object.entries(strengths.skillAverages).map(([skill, score]) => (
                            <div key={skill}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-dark-300 capitalize">{skill}</span>
                                    <span className={getScoreColor(score)}>{score}%</span>
                                </div>
                                <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                                    <div style={{ width: `${score}%` }} className={`h-full rounded-full ${score >= 80 ? 'bg-success-500' : score >= 60 ? 'bg-primary-500' : 'bg-warning-500'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
