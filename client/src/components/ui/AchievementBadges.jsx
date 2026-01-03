/**
 * Achievement Badge System
 * Gamification badges for user milestones
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Badge definitions with unlock criteria
export const BADGE_DEFINITIONS = {
    // Interview Milestones
    first_interview: {
        id: 'first_interview',
        name: 'First Steps',
        description: 'Complete your first interview',
        icon: '🎯',
        rarity: 'common',
        category: 'interviews',
        requirement: { type: 'interviews', count: 1 }
    },
    interview_10: {
        id: 'interview_10',
        name: 'Getting Started',
        description: 'Complete 10 interviews',
        icon: '🚀',
        rarity: 'common',
        category: 'interviews',
        requirement: { type: 'interviews', count: 10 }
    },
    interview_25: {
        id: 'interview_25',
        name: 'Dedicated',
        description: 'Complete 25 interviews',
        icon: '💪',
        rarity: 'uncommon',
        category: 'interviews',
        requirement: { type: 'interviews', count: 25 }
    },
    interview_50: {
        id: 'interview_50',
        name: 'Interview Pro',
        description: 'Complete 50 interviews',
        icon: '⭐',
        rarity: 'rare',
        category: 'interviews',
        requirement: { type: 'interviews', count: 50 }
    },
    interview_100: {
        id: 'interview_100',
        name: 'Interview Master',
        description: 'Complete 100 interviews',
        icon: '👑',
        rarity: 'legendary',
        category: 'interviews',
        requirement: { type: 'interviews', count: 100 }
    },

    // Streak Badges
    streak_3: {
        id: 'streak_3',
        name: 'Warming Up',
        description: 'Maintain a 3-day streak',
        icon: '🔥',
        rarity: 'common',
        category: 'streaks',
        requirement: { type: 'streak', count: 3 }
    },
    streak_7: {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        rarity: 'uncommon',
        category: 'streaks',
        requirement: { type: 'streak', count: 7 }
    },
    streak_14: {
        id: 'streak_14',
        name: 'Fortnight Fighter',
        description: 'Maintain a 14-day streak',
        icon: '⚡',
        rarity: 'rare',
        category: 'streaks',
        requirement: { type: 'streak', count: 14 }
    },
    streak_30: {
        id: 'streak_30',
        name: 'Monthly Champion',
        description: 'Maintain a 30-day streak',
        icon: '💎',
        rarity: 'epic',
        category: 'streaks',
        requirement: { type: 'streak', count: 30 }
    },
    streak_100: {
        id: 'streak_100',
        name: 'Unstoppable',
        description: 'Maintain a 100-day streak',
        icon: '🏆',
        rarity: 'legendary',
        category: 'streaks',
        requirement: { type: 'streak', count: 100 }
    },

    // Score Badges
    perfect_score: {
        id: 'perfect_score',
        name: 'Perfectionist',
        description: 'Score 100% on an interview',
        icon: '💯',
        rarity: 'rare',
        category: 'scores',
        requirement: { type: 'perfect_interview', count: 1 }
    },
    high_scorer: {
        id: 'high_scorer',
        name: 'High Achiever',
        description: 'Score 90%+ on 5 interviews',
        icon: '🌟',
        rarity: 'uncommon',
        category: 'scores',
        requirement: { type: 'high_score', count: 5 }
    },
    consistent: {
        id: 'consistent',
        name: 'Consistent Performer',
        description: 'Maintain 80%+ average over 10 interviews',
        icon: '📈',
        rarity: 'rare',
        category: 'scores',
        requirement: { type: 'avg_score_80', count: 10 }
    },

    // Daily Practice
    daily_first: {
        id: 'daily_first',
        name: 'Daily Devotee',
        description: 'Complete your first daily practice',
        icon: '📝',
        rarity: 'common',
        category: 'daily',
        requirement: { type: 'daily_practice', count: 1 }
    },
    daily_7: {
        id: 'daily_7',
        name: 'Practice Makes Perfect',
        description: 'Complete 7 daily practices',
        icon: '📚',
        rarity: 'uncommon',
        category: 'daily',
        requirement: { type: 'daily_practice', count: 7 }
    },
    daily_30: {
        id: 'daily_30',
        name: 'Dedicated Learner',
        description: 'Complete 30 daily practices',
        icon: '🎓',
        rarity: 'rare',
        category: 'daily',
        requirement: { type: 'daily_practice', count: 30 }
    },

    // Special Badges
    speed_demon: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete an interview in under 10 minutes',
        icon: '⚡',
        rarity: 'uncommon',
        category: 'special',
        requirement: { type: 'fast_interview', count: 1 }
    },
    voice_master: {
        id: 'voice_master',
        name: 'Voice Master',
        description: 'Use voice input for 10 interviews',
        icon: '🎤',
        rarity: 'uncommon',
        category: 'special',
        requirement: { type: 'voice_interviews', count: 10 }
    },
    night_owl: {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Practice after midnight',
        icon: '🦉',
        rarity: 'common',
        category: 'special',
        requirement: { type: 'late_practice', count: 1 }
    },
    early_bird: {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Practice before 6 AM',
        icon: '🐦',
        rarity: 'common',
        category: 'special',
        requirement: { type: 'early_practice', count: 1 }
    },

    // Interview Type Badges
    tech_expert: {
        id: 'tech_expert',
        name: 'Tech Expert',
        description: 'Complete 20 technical interviews',
        icon: '💻',
        rarity: 'rare',
        category: 'types',
        requirement: { type: 'technical_interviews', count: 20 }
    },
    people_person: {
        id: 'people_person',
        name: 'People Person',
        description: 'Complete 20 behavioral interviews',
        icon: '🤝',
        rarity: 'rare',
        category: 'types',
        requirement: { type: 'behavioral_interviews', count: 20 }
    },
    architect: {
        id: 'architect',
        name: 'Architect',
        description: 'Complete 20 system design interviews',
        icon: '🏗️',
        rarity: 'rare',
        category: 'types',
        requirement: { type: 'system_design_interviews', count: 20 }
    },
    hr_ready: {
        id: 'hr_ready',
        name: 'HR Ready',
        description: 'Complete 20 HR interviews',
        icon: '💼',
        rarity: 'rare',
        category: 'types',
        requirement: { type: 'hr_interviews', count: 20 }
    },
    all_rounder: {
        id: 'all_rounder',
        name: 'All Rounder',
        description: 'Complete 5+ interviews in each category',
        icon: '🎯',
        rarity: 'epic',
        category: 'types',
        requirement: { type: 'all_categories', count: 5 }
    }
};

// Rarity colors and styles
const RARITY_STYLES = {
    common: {
        bg: 'from-gray-500/20 to-gray-600/20',
        border: 'border-gray-500/30',
        text: 'text-gray-400',
        glow: '',
        label: 'Common'
    },
    uncommon: {
        bg: 'from-green-500/20 to-emerald-500/20',
        border: 'border-green-500/30',
        text: 'text-green-400',
        glow: '',
        label: 'Uncommon'
    },
    rare: {
        bg: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        glow: 'shadow-lg shadow-blue-500/10',
        label: 'Rare'
    },
    epic: {
        bg: 'from-purple-500/20 to-pink-500/20',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        glow: 'shadow-lg shadow-purple-500/20',
        label: 'Epic'
    },
    legendary: {
        bg: 'from-yellow-500/20 to-orange-500/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        glow: 'shadow-xl shadow-yellow-500/30',
        label: 'Legendary'
    }
};

// Single Badge Component
export function Badge({ badge, unlocked = false, showProgress = false, progress = 0, onClick }) {
    const rarityStyle = RARITY_STYLES[badge.rarity];

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-3 sm:p-4 rounded-xl border transition-all ${unlocked
                    ? `bg-gradient-to-br ${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.glow}`
                    : 'bg-dark-800/50 border-dark-700 opacity-50 grayscale'
                }`}
        >
            {/* Icon */}
            <div className="text-2xl sm:text-3xl mb-2">{badge.icon}</div>

            {/* Name */}
            <h4 className={`font-semibold text-xs sm:text-sm ${unlocked ? 'text-white' : 'text-dark-500'}`}>
                {badge.name}
            </h4>

            {/* Rarity tag */}
            {unlocked && (
                <span className={`text-[9px] sm:text-xs ${rarityStyle.text}`}>
                    {rarityStyle.label}
                </span>
            )}

            {/* Progress bar for locked badges */}
            {!unlocked && showProgress && (
                <div className="mt-2 h-1 bg-dark-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            )}

            {/* Lock icon for locked badges */}
            {!unlocked && (
                <div className="absolute top-2 right-2 text-dark-500 text-xs">🔒</div>
            )}
        </motion.button>
    );
}

// Badge Detail Modal
export function BadgeModal({ badge, unlocked, onClose }) {
    if (!badge) return null;

    const rarityStyle = RARITY_STYLES[badge.rarity];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`bg-dark-900 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center border ${rarityStyle.border} ${rarityStyle.glow}`}
            >
                {/* Icon with animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className={`text-6xl sm:text-7xl mb-4 ${!unlocked ? 'grayscale opacity-50' : ''}`}
                >
                    {badge.icon}
                </motion.div>

                {/* Badge name */}
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {badge.name}
                </h2>

                {/* Rarity */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 bg-gradient-to-r ${rarityStyle.bg} ${rarityStyle.text} border ${rarityStyle.border}`}>
                    {rarityStyle.label}
                </span>

                {/* Description */}
                <p className="text-dark-400 text-sm mb-4">
                    {badge.description}
                </p>

                {/* Status */}
                <div className={`py-3 px-4 rounded-xl ${unlocked ? 'bg-success-500/10 border border-success-500/30' : 'bg-dark-800/50 border border-dark-700'}`}>
                    {unlocked ? (
                        <p className="text-success-400 font-medium flex items-center justify-center gap-2">
                            <span>✓</span> Unlocked!
                        </p>
                    ) : (
                        <p className="text-dark-400 text-sm">
                            🔒 Complete the requirement to unlock
                        </p>
                    )}
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="mt-4 w-full btn-primary"
                >
                    Close
                </button>
            </motion.div>
        </motion.div>
    );
}

// Badge Grid Component
export function BadgeGrid({ badges = [], unlockedBadgeIds = [], showLocked = true, onBadgeClick }) {
    const allBadges = Object.values(BADGE_DEFINITIONS);
    const displayBadges = badges.length > 0 ? badges : allBadges;

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
            {displayBadges.map((badge) => {
                const unlocked = unlockedBadgeIds.includes(badge.id);
                if (!showLocked && !unlocked) return null;

                return (
                    <Badge
                        key={badge.id}
                        badge={badge}
                        unlocked={unlocked}
                        onClick={() => onBadgeClick?.(badge)}
                    />
                );
            })}
        </div>
    );
}

// Badge Unlock Celebration Component
export function BadgeUnlockCelebration({ badge, onClose }) {
    if (!badge) return null;

    const rarityStyle = RARITY_STYLES[badge.rarity];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
                {/* Confetti particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 1,
                                x: '50vw',
                                y: '50vh',
                                scale: 0
                            }}
                            animate={{
                                opacity: 0,
                                x: `${Math.random() * 100}vw`,
                                y: `${Math.random() * 100}vh`,
                                scale: [0, 1, 0.5],
                                rotate: Math.random() * 720
                            }}
                            transition={{
                                duration: 2,
                                delay: i * 0.05,
                                ease: 'easeOut'
                            }}
                            className={`absolute w-3 h-3 rounded-full ${['bg-yellow-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'][i % 5]
                                }`}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className={`bg-dark-900 rounded-3xl p-8 max-w-md w-full text-center border-2 ${rarityStyle.border} shadow-2xl`}
                    style={{
                        boxShadow: `0 0 60px ${badge.rarity === 'legendary' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
                    }}
                >
                    {/* New badge label */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm font-semibold text-primary-400 mb-4"
                    >
                        🎉 NEW BADGE UNLOCKED!
                    </motion.div>

                    {/* Badge icon with glow */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-7xl sm:text-8xl mb-4 filter drop-shadow-lg"
                    >
                        {badge.icon}
                    </motion.div>

                    {/* Badge name */}
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-2xl sm:text-3xl font-bold text-white mb-2"
                    >
                        {badge.name}
                    </motion.h2>

                    {/* Rarity */}
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4 bg-gradient-to-r ${rarityStyle.bg} ${rarityStyle.text} border ${rarityStyle.border}`}
                    >
                        {rarityStyle.label}
                    </motion.span>

                    {/* Description */}
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-dark-400 mb-6"
                    >
                        {badge.description}
                    </motion.p>

                    {/* Close button */}
                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        onClick={onClose}
                        className="btn-primary w-full py-3 text-lg"
                    >
                        Awesome! 🎉
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Badge Summary Component (for profile/dashboard)
export function BadgeSummary({ unlockedBadgeIds = [], onViewAll }) {
    const unlockedBadges = unlockedBadgeIds
        .map(id => BADGE_DEFINITIONS[id])
        .filter(Boolean)
        .slice(0, 5);

    const totalBadges = Object.keys(BADGE_DEFINITIONS).length;
    const unlockedCount = unlockedBadgeIds.length;

    return (
        <div className="bg-dark-900/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-dark-800/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                    🏅 Achievements
                </h3>
                <span className="text-xs sm:text-sm text-dark-400">
                    {unlockedCount}/{totalBadges}
                </span>
            </div>

            {unlockedBadges.length > 0 ? (
                <>
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 hide-scrollbar">
                        {unlockedBadges.map((badge) => (
                            <div
                                key={badge.id}
                                className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${RARITY_STYLES[badge.rarity].bg} border ${RARITY_STYLES[badge.rarity].border} flex items-center justify-center text-xl`}
                            >
                                {badge.icon}
                            </div>
                        ))}
                        {unlockedCount > 5 && (
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-dark-800/50 border border-dark-700 flex items-center justify-center text-xs text-dark-400">
                                +{unlockedCount - 5}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onViewAll}
                        className="text-primary-400 hover:text-primary-300 text-xs sm:text-sm flex items-center gap-1 transition-colors"
                    >
                        View all badges →
                    </button>
                </>
            ) : (
                <div className="text-center py-4">
                    <p className="text-dark-500 text-sm mb-2">No badges unlocked yet</p>
                    <p className="text-dark-600 text-xs">Complete activities to earn badges!</p>
                </div>
            )}
        </div>
    );
}

export default Badge;
