/**
 * Skeleton Loading Components
 * Modern shimmer-effect skeleton loaders for better UX
 */

// Base Skeleton with shimmer effect
export function Skeleton({ className = '', animate = true }) {
    return (
        <div
            className={`bg-dark-800/80 rounded ${animate ? 'animate-shimmer' : ''} ${className}`}
            style={{
                backgroundImage: animate
                    ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)'
                    : undefined,
                backgroundSize: '200% 100%',
            }}
        />
    );
}

// Text line skeleton
export function SkeletonText({ lines = 1, className = '' }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

// Avatar skeleton
export function SkeletonAvatar({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return <Skeleton className={`rounded-full ${sizes[size]} ${className}`} />;
}

// Card skeleton for dashboard stats
export function SkeletonStatCard({ className = '' }) {
    return (
        <div className={`bg-dark-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-2.5 sm:p-4 lg:p-6 border border-dark-800/50 ${className}`}>
            <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl mb-1.5 sm:mb-2 lg:mb-3" />
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-5 sm:h-6 lg:h-8 w-12" />
        </div>
    );
}

// Interview card skeleton
export function SkeletonInterviewCard({ className = '' }) {
    return (
        <div className={`flex items-center justify-between p-2 sm:p-3 bg-dark-800/50 rounded-lg ${className}`}>
            <div className="flex items-center gap-2 sm:gap-3">
                <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
                <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <div className="text-right">
                <Skeleton className="h-5 w-12 mb-1" />
                <Skeleton className="h-3 w-10" />
            </div>
        </div>
    );
}

// Question skeleton for daily practice
export function SkeletonQuestion({ className = '' }) {
    return (
        <div className={`glass-card p-4 sm:p-8 ${className}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Question number buttons */}
            <div className="flex gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
                ))}
            </div>

            {/* Question text */}
            <div className="space-y-2 mb-6">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-4/5" />
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
                <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
        </div>
    );
}

// Dashboard skeleton
export function SkeletonDashboard() {
    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Skeleton className="h-7 sm:h-8 lg:h-10 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-36 rounded-lg" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonStatCard key={i} />
                ))}
            </div>

            {/* Daily Practice Card */}
            <Skeleton className="h-24 sm:h-28 rounded-xl lg:rounded-2xl" />

            {/* Content Grid */}
            <div className="grid gap-3 sm:gap-4 lg:gap-6 lg:grid-cols-3">
                <Skeleton className="h-40 rounded-xl lg:rounded-2xl" />
                <div className="lg:col-span-2 bg-dark-900/80 rounded-xl p-4">
                    <Skeleton className="h-5 w-40 mb-4" />
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonInterviewCard key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Daily practice page skeleton
export function SkeletonDailyPractice() {
    return (
        <div className="min-h-screen py-3 sm:py-6 px-2 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-4 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <Skeleton className="h-8 sm:h-10 w-48 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-12 w-24 rounded-2xl" />
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 bg-dark-900/50 rounded-xl p-4">
                        <div className="flex justify-between mb-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-28 rounded-xl" />
                    ))}
                </div>

                {/* Content */}
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Categories */}
                    <div className="lg:col-span-1 space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-2xl" />
                        ))}
                    </div>

                    {/* Question Area */}
                    <div className="lg:col-span-3">
                        <SkeletonQuestion />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Leaderboard skeleton
export function SkeletonLeaderboard({ count = 5 }) {
    return (
        <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-dark-700">
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="divide-y divide-dark-700">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="text-right">
                            <Skeleton className="h-5 w-12 mb-1" />
                            <Skeleton className="h-3 w-10" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Skeleton;
