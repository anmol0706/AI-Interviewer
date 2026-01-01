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
        <div className="space-y-3 sm:space-y-5 lg:space-y-8">
            {/* Header */}
            <div className="text-center sm:text-left">
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-white mb-0.5 lg:mb-2">Interview History</h1>
                <p className="text-dark-400 text-xs sm:text-sm lg:text-base">Review your past interviews and track progress</p>
            </div>

            {/* Filters */}
            <div className="bg-dark-900/80 backdrop-blur-sm rounded-lg lg:rounded-2xl border border-dark-800/50 p-2.5 sm:p-3 lg:p-4">
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                    <Filter className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-dark-500" />
                    <span className="text-dark-500 text-[10px] sm:text-xs lg:text-sm">Filter:</span>

                    {/* Filter dropdowns */}
                    <div className="flex gap-1.5 lg:gap-3 flex-1">
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                            className="bg-dark-800/50 border border-dark-700/50 rounded-md lg:rounded-lg px-2 lg:px-4 py-1.5 lg:py-2 text-[10px] sm:text-xs lg:text-sm text-white flex-1"
                        >
                            <option value="">All Types</option>
                            <option value="technical">Technical</option>
                            <option value="behavioral">Behavioral</option>
                            <option value="system-design">System</option>
                            <option value="hr">HR</option>
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                            className="bg-dark-800/50 border border-dark-700/50 rounded-md lg:rounded-lg px-2 lg:px-4 py-1.5 lg:py-2 text-[10px] sm:text-xs lg:text-sm text-white flex-1"
                        >
                            <option value="">All</option>
                            <option value="completed">Done</option>
                            <option value="in-progress">Active</option>
                            <option value="abandoned">Left</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Interview List */}
            {isLoading ? (
                <div className="space-y-2 lg:space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 lg:h-20 skeleton rounded-lg lg:rounded-xl" />
                    ))}
                </div>
            ) : interviews.length > 0 ? (
                <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                    {interviews.map((interview, index) => (
                        <motion.div
                            key={interview.sessionId}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Link
                                to={`/interview/${interview.sessionId}/report`}
                                className="bg-dark-900/60 hover:bg-dark-800/80 border border-dark-800/50 rounded-lg lg:rounded-xl p-2.5 sm:p-3 lg:p-4 flex items-center gap-2.5 sm:gap-3 lg:gap-4 transition-all"
                            >
                                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 rounded-lg lg:rounded-xl bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-primary-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xs sm:text-sm lg:text-base font-medium text-white capitalize truncate">
                                        {interview.interviewType}
                                    </h3>
                                    <div className="flex items-center gap-2 lg:gap-3 text-[9px] sm:text-xs lg:text-sm text-dark-500">
                                        <span className="flex items-center gap-0.5 lg:gap-1">
                                            <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
                                            {new Date(interview.startedAt).toLocaleDateString()}
                                        </span>
                                        <span>{interview.questionsAnswered}/{interview.totalQuestions}Q</span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className={`text-sm sm:text-base lg:text-lg font-bold px-2 lg:px-3 py-0.5 lg:py-1 rounded-md lg:rounded-lg ${getScoreColor(interview.score)}`}>
                                        {interview.score}%
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-dark-500 flex-shrink-0" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-dark-900/60 border border-dark-800/50 rounded-xl lg:rounded-2xl p-8 lg:p-12 text-center">
                    <BarChart3 className="w-12 h-12 lg:w-16 lg:h-16 text-dark-600 mx-auto mb-3 lg:mb-4" />
                    <h3 className="text-base lg:text-xl font-semibold text-white mb-1 lg:mb-2">No interviews found</h3>
                    <p className="text-dark-400 text-xs lg:text-sm mb-4 lg:mb-6">Start your first interview to see your history here</p>
                    <Link to="/interview/new" className="bg-primary-500 hover:bg-primary-600 text-white text-xs lg:text-sm font-medium px-4 lg:px-6 py-2 lg:py-3 rounded-lg inline-flex items-center gap-1.5 shadow-lg shadow-primary-500/20 transition-all">
                        Start Interview
                    </Link>
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-3 flex-wrap">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setFilters({ ...filters, page })}
                            className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl font-medium text-sm sm:text-base lg:text-lg transition-all min-h-[44px] ${filters.page === page
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
