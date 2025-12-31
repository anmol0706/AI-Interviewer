import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { interviewService } from '../services/interviewService';
import {
    Calendar,
    Filter,
    Search,
    BarChart3,
    Clock,
    ChevronRight,
    FileText
} from 'lucide-react';

export default function History() {
    const [filters, setFilters] = useState({
        type: '',
        status: 'completed',
        page: 1,
        limit: 10
    });

    const { data, isLoading } = useQuery({
        queryKey: ['interview-history', filters],
        queryFn: () => interviewService.getHistory(filters)
    });

    const interviews = data?.data?.interviews || [];
    const pagination = data?.data?.pagination;

    const getScoreColor = (score) => {
        if (score >= 85) return 'text-success-400 bg-success-500/10';
        if (score >= 70) return 'text-primary-400 bg-primary-500/10';
        if (score >= 55) return 'text-warning-400 bg-warning-500/10';
        return 'text-error-400 bg-error-500/10';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Interview History</h1>
                    <p className="text-dark-400">Review your past interviews and track progress</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-dark-400" />
                        <span className="text-dark-400 text-sm">Filter:</span>
                    </div>

                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                        className="input py-2 w-40"
                    >
                        <option value="">All Types</option>
                        <option value="technical">Technical</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="system-design">System Design</option>
                        <option value="hr">HR</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="input py-2 w-40"
                    >
                        <option value="">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="abandoned">Abandoned</option>
                    </select>
                </div>
            </div>

            {/* Interview List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-24 skeleton rounded-2xl" />
                    ))}
                </div>
            ) : interviews.length > 0 ? (
                <div className="space-y-4">
                    {interviews.map((interview, index) => (
                        <motion.div
                            key={interview.sessionId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                to={`/interview/${interview.sessionId}/report`}
                                className="glass-card-hover p-6 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                        <BarChart3 className="w-7 h-7 text-primary-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white capitalize mb-1">
                                            {interview.interviewType} Interview
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-dark-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(interview.startedAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {Math.floor((interview.duration || 0) / 60)} min
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                {interview.questionsAnswered}/{interview.totalQuestions} questions
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(interview.score)}`}>
                                            {interview.score}%
                                        </div>
                                        <div className="text-dark-400 text-sm mt-1 capitalize">{interview.difficulty}</div>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-dark-400" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <BarChart3 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No interviews found</h3>
                    <p className="text-dark-400 mb-6">Start your first interview to see your history here</p>
                    <Link to="/interview/new" className="btn-primary">
                        Start Interview
                    </Link>
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setFilters({ ...filters, page })}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${filters.page === page
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
