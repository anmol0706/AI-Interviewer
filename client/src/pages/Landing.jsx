import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Brain,
    Mic,
    BarChart3,
    Target,
    Users,
    Zap,
    Shield,
    ArrowRight,
    Check,
    MessageSquare,
    TrendingUp,
    Award
} from 'lucide-react';

const features = [
    {
        icon: Brain,
        title: 'AI-Powered Questions',
        description: 'Gemini AI generates relevant questions and adapts difficulty based on your performance.'
    },
    {
        icon: Mic,
        title: 'Voice Analysis',
        description: 'Real-time speech analysis detects hesitation, filler words, and confidence levels.'
    },
    {
        icon: Target,
        title: 'Adaptive Difficulty',
        description: 'Questions automatically adjust to challenge you at the right level.'
    },
    {
        icon: BarChart3,
        title: 'Deep Analytics',
        description: 'Comprehensive reports with reasoning scores, communication clarity, and improvement plans.'
    },
    {
        icon: Users,
        title: 'Interview Styles',
        description: 'Choose from strict FAANG-style, friendly, or professional interviewer personalities.'
    },
    {
        icon: Shield,
        title: 'Secure & Private',
        description: 'Your data is encrypted and never shared. Practice with confidence.'
    }
];

const interviewTypes = [
    { name: 'Technical', color: 'from-blue-500 to-cyan-500' },
    { name: 'Behavioral', color: 'from-purple-500 to-pink-500' },
    { name: 'System Design', color: 'from-orange-500 to-red-500' },
    { name: 'HR', color: 'from-green-500 to-emerald-500' }
];

const stats = [
    { value: '50K+', label: 'Interviews Conducted' },
    { value: '95%', label: 'User Satisfaction' },
    { value: '2x', label: 'Faster Improvement' },
    { value: '85%', label: 'Job Success Rate' }
];

export default function Landing() {
    return (
        <div className="min-h-screen bg-dark-950">
            {/* Navigation - Professional mobile design */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/90 backdrop-blur-xl border-b border-dark-800/30 safe-area-padding">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 sm:gap-2.5">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <span className="font-display text-sm sm:text-base md:text-lg font-bold gradient-text tracking-tight">
                                AI Interviewer
                            </span>
                        </Link>
                        {/* Nav buttons */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link to="/login" className="text-dark-300 hover:text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all shadow-lg shadow-primary-500/25">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Professional mobile design */}
            <section className="pt-16 sm:pt-20 md:pt-28 pb-8 sm:pb-12 md:pb-16 px-4 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-1/4 w-[200px] sm:w-[350px] md:w-[500px] h-[200px] sm:h-[350px] md:h-[500px] bg-primary-500/15 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-1/4 w-[200px] sm:w-[350px] md:w-[500px] h-[200px] sm:h-[350px] md:h-[500px] bg-secondary-500/15 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] sm:text-xs font-medium mb-4 sm:mb-5">
                            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>Powered by Gemini AI</span>
                        </div>

                        {/* Main heading */}
                        <h1 className="text-[22px] sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-[1.2] tracking-tight">
                            Master Your Interviews with{' '}
                            <span className="gradient-text">AI-Powered</span> Practice
                        </h1>

                        {/* Subheading */}
                        <p className="text-xs sm:text-sm md:text-base text-dark-400 mb-5 sm:mb-6 max-w-xl mx-auto leading-relaxed">
                            Practice with an AI that adapts to your skill level and provides personalized feedback to help you land your dream job.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                            <Link to="/register" className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-[11px] sm:text-sm font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all shadow-lg shadow-primary-500/30">
                                Start Free Practice
                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Link>
                            <button className="inline-flex items-center gap-1.5 bg-dark-800/80 hover:bg-dark-700 text-white text-[11px] sm:text-sm font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border border-dark-700 transition-all">
                                Watch Demo
                            </button>
                        </div>

                        {/* Interview Types */}
                        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
                            {interviewTypes.map((type) => (
                                <div
                                    key={type.name}
                                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r ${type.color} text-white text-[10px] sm:text-xs font-medium shadow-sm`}
                                >
                                    {type.name}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Hero Image/Mockup - Professional design */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="mt-8 sm:mt-12 md:mt-16 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent z-10 pointer-events-none" />
                        <div className="bg-dark-900/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-dark-800/50 shadow-2xl shadow-primary-500/5">
                            {/* Mock Interview Interface */}
                            <div className="grid md:grid-cols-2 gap-3 sm:gap-5 md:gap-6">
                                <div className="space-y-2.5 sm:space-y-3">
                                    <div className="flex items-center gap-2 sm:gap-2.5">
                                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-primary-500/15 flex items-center justify-center">
                                            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs text-dark-500">AI Interviewer</p>
                                            <p className="text-white text-xs sm:text-sm font-medium">Technical Interview</p>
                                        </div>
                                    </div>
                                    <div className="bg-dark-800/50 rounded-lg p-2.5 sm:p-3 border border-dark-700/30">
                                        <p className="text-dark-300 text-[11px] sm:text-xs md:text-sm leading-relaxed">
                                            "Can you explain the difference between a stack and a queue? Please provide examples."
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-dark-500">
                                        <span className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 font-medium">Medium</span>
                                        <span>Question 3/10</span>
                                    </div>
                                </div>
                                <div className="bg-dark-800/30 rounded-lg p-2.5 sm:p-3 border border-dark-700/30">
                                    <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                                        <span className="text-[10px] sm:text-xs text-dark-500">Your Score</span>
                                        <span className="text-base sm:text-lg font-bold text-success-400">87%</span>
                                    </div>
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <div className="flex justify-between text-[10px] sm:text-xs">
                                            <span className="text-dark-500">Correctness</span>
                                            <span className="text-white font-medium">90%</span>
                                        </div>
                                        <div className="h-1 sm:h-1.5 bg-dark-700 rounded-full overflow-hidden">
                                            <div className="h-full w-[90%] bg-gradient-to-r from-success-500 to-success-400 rounded-full" />
                                        </div>
                                        <div className="flex justify-between text-[10px] sm:text-xs">
                                            <span className="text-dark-500">Communication</span>
                                            <span className="text-white font-medium">82%</span>
                                        </div>
                                        <div className="h-1 sm:h-1.5 bg-dark-700 rounded-full overflow-hidden">
                                            <div className="h-full w-[82%] bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section - Single row on all screens */}
            <section className="py-8 sm:py-12 md:py-16 px-2 sm:px-4 border-y border-dark-800">
                <div className="max-w-7xl mx-auto">
                    {/* 4 columns on all screens */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                {/* Smaller text on mobile */}
                                <div className="text-base sm:text-2xl md:text-4xl lg:text-5xl font-bold gradient-text mb-0.5 sm:mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-dark-400 text-[10px] sm:text-xs md:text-sm lg:text-base leading-tight">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section - Smaller text on mobile */}
            <section className="py-12 sm:py-16 md:py-24 px-3 sm:px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-8 sm:mb-12 md:mb-16"
                    >
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">
                            Everything You Need to{' '}
                            <span className="gradient-text">Ace Your Interview</span>
                        </h2>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-dark-400 max-w-2xl mx-auto px-2">
                            Our AI-powered platform provides comprehensive tools to prepare you for any interview scenario.
                        </p>
                    </motion.div>

                    {/* 3 columns on all screens */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card-hover p-2 sm:p-4 md:p-6"
                            >
                                <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                                    <feature.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6 text-primary-400" />
                                </div>
                                <h3 className="text-[10px] sm:text-sm md:text-lg lg:text-xl font-semibold text-white mb-0.5 sm:mb-1 md:mb-2 leading-tight">{feature.title}</h3>
                                <p className="text-dark-400 text-[8px] sm:text-xs md:text-sm leading-tight line-clamp-2 sm:line-clamp-none">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Compact mobile design */}
            <section className="py-8 sm:py-12 md:py-16 px-2 sm:px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-card p-4 sm:p-6 md:p-8 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10" />
                        <div className="relative z-10">
                            <Award className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-400 mx-auto mb-2 sm:mb-4" />
                            <h2 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold mb-1.5 sm:mb-2">
                                Ready to Nail Your Next Interview?
                            </h2>
                            <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-dark-300 mb-3 sm:mb-5 max-w-xl mx-auto leading-relaxed">
                                Join thousands of candidates who have improved their interview skills with our AI-powered platform.
                            </p>
                            <div className="flex items-center justify-center">
                                <Link to="/register" className="btn-primary text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5">
                                    Start Free Today
                                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Link>
                            </div>
                            {/* Feature list - Single row on mobile */}
                            <div className="flex flex-row items-center justify-center gap-3 sm:gap-5 mt-3 sm:mt-5 text-[9px] sm:text-xs md:text-sm text-dark-400">
                                <span className="flex items-center gap-0.5 sm:gap-1.5">
                                    <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-success-400" />
                                    5 Free Interviews
                                </span>
                                <span className="flex items-center gap-0.5 sm:gap-1.5">
                                    <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-success-400" />
                                    No Credit Card
                                </span>
                                <span className="flex items-center gap-0.5 sm:gap-1.5">
                                    <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-success-400" />
                                    Cancel Anytime
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer - Mobile-first with proper spacing */}
            <footer className="py-8 sm:py-10 md:py-12 px-4 border-t border-dark-800 safe-area-padding">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="font-display font-bold gradient-text text-sm sm:text-base">AI Interviewer</span>
                        </div>
                        <p className="text-dark-500 text-xs sm:text-sm">
                            © 2024 AI Interviewer. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
