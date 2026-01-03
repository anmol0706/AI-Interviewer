/**
 * Achievements Page
 * Display all badges and user achievements
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { analyticsService } from '../services/interviewService';
import {
    BadgeGrid,
    BadgeModal,
    BadgeUnlockCelebration,
    BADGE_DEFINITIONS
} from '../components/ui/AchievementBadges';
import { Skeleton } from '../components/ui/Skeleton';
import { Trophy, Star, Flame, Target, Award, TrendingUp } from 'lucide-react';

// Category filters
const CATEGORIES = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'interviews', name: 'Interviews', icon: '💼' },
    { id: 'streaks', name: 'Streaks', icon: '🔥' },
    { id: 'scores', name: 'Scores', icon: '⭐' },
    { id: 'daily', name: 'Daily Practice', icon: '📝' },
    { id: 'types', name: 'Interview Types', icon: '🎯' },
    { id: 'special', name: 'Special', icon: '✨' }
];

// Rarity filters
const RARITIES = [
    { id: 'all', name: 'All Rarities' },
    { id: 'common', name: 'Common', color: 'text-gray-400' },
    { id: 'uncommon', name: 'Uncommon', color: 'text-green-400' },
    { id: 'rare', name: 'Rare', color: 'text-blue-400' },
    { id: 'epic', name: 'Epic', color: 'text-purple-400' },
    { id: 'legendary', name: 'Legendary', color: 'text-yellow-400' }
];

export default function Achievements() {
    const { user } = useAuthStore();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRarity, setSelectedRarity] = useState('all');
    const [showLocked, setShowLocked] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [newBadge, setNewBadge] = useState(null);

    // Fetch user badges/achievements data
    const { data: achievementsData, isLoading } = useQuery({
        queryKey: ['achievements'],
        queryFn: analyticsService.getDashboard // We'll use dashboard data for now
    });

    // Calculate unlocked badges based on user stats
    const calculateUnlockedBadges = () => {
        const stats = achievementsData?.data;
        if (!stats) return [];

        const unlocked = [];
        const overview = stats.overview || {};

        // Interview milestone badges
        if (overview.totalInterviews >= 1) unlocked.push('first_interview');
        if (overview.totalInterviews >= 10) unlocked.push('interview_10');
        if (overview.totalInterviews >= 25) unlocked.push('interview_25');
        if (overview.totalInterviews >= 50) unlocked.push('interview_50');
        if (overview.totalInterviews >= 100) unlocked.push('interview_100');

        // Streak badges
        const streak = overview.currentStreak || 0;
        const longestStreak = overview.longestStreak || streak;
        if (longestStreak >= 3) unlocked.push('streak_3');
        if (longestStreak >= 7) unlocked.push('streak_7');
        if (longestStreak >= 14) unlocked.push('streak_14');
        if (longestStreak >= 30) unlocked.push('streak_30');
        if (longestStreak >= 100) unlocked.push('streak_100');

        // Score badges
        if (overview.averageScore >= 80) unlocked.push('consistent');
        if (stats.recentInterviews?.some(i => i.score >= 100)) unlocked.push('perfect_score');
        if ((stats.recentInterviews?.filter(i => i.score >= 90).length || 0) >= 5) unlocked.push('high_scorer');

        // Daily practice badges (simulated)
        const dailyDaysCompleted = user?.statistics?.streakDays || 0;
        if (dailyDaysCompleted >= 1) unlocked.push('daily_first');
        if (dailyDaysCompleted >= 7) unlocked.push('daily_7');
        if (dailyDaysCompleted >= 30) unlocked.push('daily_30');

        // Time-based badges
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 5) unlocked.push('night_owl');
        if (hour >= 4 && hour < 6) unlocked.push('early_bird');

        return unlocked;
    };

    const unlockedBadgeIds = calculateUnlockedBadges();

    // Filter badges
    const allBadges = Object.values(BADGE_DEFINITIONS);
    const filteredBadges = allBadges.filter(badge => {
        if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
        if (selectedRarity !== 'all' && badge.rarity !== selectedRarity) return false;
        if (!showLocked && !unlockedBadgeIds.includes(badge.id)) return false;
        return true;
    });

    // Stats
    const totalBadges = allBadges.length;
    const unlockedCount = unlockedBadgeIds.length;
    const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

    // Group badges by category for display
    const badgesByCategory = CATEGORIES.slice(1).map(cat => ({
        ...cat,
        badges: filteredBadges.filter(b => b.category === cat.id),
        unlockedCount: filteredBadges.filter(b => b.category === cat.id && unlockedBadgeIds.includes(b.id)).length,
        totalCount: allBadges.filter(b => b.category === cat.id).length
    }));

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Header skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-20 w-32 rounded-2xl" />
                </div>

                {/* Progress skeleton */}
                <Skeleton className="h-24 rounded-2xl" />

                {/* Badges grid skeleton */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 flex items-center gap-2">
                        <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400" />
                        Achievements
                    </h1>
                    <p className="text-dark-400 text-sm">
                        Collect badges by completing milestones
                    </p>
                </div>

                {/* Overall progress */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-4 text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-yellow-400">{unlockedCount}</div>
                    <div className="text-dark-400 text-xs">of {totalBadges} badges</div>
                </div>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-dark-900/80 rounded-2xl p-4 sm:p-6 border border-dark-800/50"
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">Collection Progress</span>
                    <span className="text-sm font-bold text-primary-400">{progressPercent}%</span>
                </div>
                <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                    />
                </div>
                <div className="flex justify-between mt-3 text-xs text-dark-500">
                    <span>🥉 Bronze: 25%</span>
                    <span>🥈 Silver: 50%</span>
                    <span>🥇 Gold: 75%</span>
                    <span>💎 Diamond: 100%</span>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
            >
                {/* Category filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap text-sm transition-all ${selectedCategory === cat.id
                                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                    : 'bg-dark-800/50 text-dark-400 border border-transparent hover:border-dark-600'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Additional filters */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Rarity filter */}
                    <select
                        value={selectedRarity}
                        onChange={(e) => setSelectedRarity(e.target.value)}
                        className="bg-dark-800/50 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                    >
                        {RARITIES.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                    </select>

                    {/* Show locked toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showLocked}
                            onChange={(e) => setShowLocked(e.target.checked)}
                            className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-dark-400">Show locked</span>
                    </label>

                    {/* Results count */}
                    <span className="text-xs text-dark-500 ml-auto">
                        {filteredBadges.length} badges
                    </span>
                </div>
            </motion.div>

            {/* Badge Grid */}
            {selectedCategory === 'all' ? (
                // Show by category when "All" is selected
                <div className="space-y-6">
                    {badgesByCategory.map((category, index) => {
                        if (category.badges.length === 0) return null;

                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                        <span>{category.icon}</span>
                                        {category.name}
                                    </h3>
                                    <span className="text-xs text-dark-500">
                                        {category.unlockedCount}/{category.totalCount}
                                    </span>
                                </div>
                                <BadgeGrid
                                    badges={category.badges}
                                    unlockedBadgeIds={unlockedBadgeIds}
                                    showLocked={showLocked}
                                    onBadgeClick={setSelectedBadge}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                // Show flat grid for specific category
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <BadgeGrid
                        badges={filteredBadges}
                        unlockedBadgeIds={unlockedBadgeIds}
                        showLocked={showLocked}
                        onBadgeClick={setSelectedBadge}
                    />
                </motion.div>
            )}

            {/* Empty state */}
            {filteredBadges.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-5xl mb-4">🏅</div>
                    <h3 className="text-lg font-semibold text-white mb-2">No badges found</h3>
                    <p className="text-dark-400 text-sm">
                        Try adjusting your filters or unlock more badges!
                    </p>
                </div>
            )}

            {/* Badge Detail Modal */}
            {selectedBadge && (
                <BadgeModal
                    badge={selectedBadge}
                    unlocked={unlockedBadgeIds.includes(selectedBadge.id)}
                    onClose={() => setSelectedBadge(null)}
                />
            )}

            {/* New Badge Celebration */}
            {newBadge && (
                <BadgeUnlockCelebration
                    badge={newBadge}
                    onClose={() => setNewBadge(null)}
                />
            )}
        </div>
    );
}
