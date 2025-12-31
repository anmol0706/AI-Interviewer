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
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-display text-xl font-bold gradient-text">
                                AI Interviewer
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="btn-ghost">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn-primary">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary-500/20 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-sm font-medium mb-6">
                            <Zap className="w-4 h-4" />
                            Powered by Google Gemini AI
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Master Your Interviews with{' '}
                            <span className="gradient-text">AI-Powered</span> Practice
                        </h1>

                        <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
                            Practice with an AI interviewer that adapts to your skill level, analyzes your speech patterns,
                            and provides personalized feedback to help you land your dream job.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register" className="btn-primary text-lg px-8 py-4">
                                Start Free Practice
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button className="btn-secondary text-lg px-8 py-4">
                                Watch Demo
                            </button>
                        </div>

                        {/* Interview Types Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
                            {interviewTypes.map((type) => (
                                <div
                                    key={type.name}
                                    className={`px-4 py-2 rounded-full bg-gradient-to-r ${type.color} text-white text-sm font-medium`}
                                >
                                    {type.name}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Hero Image/Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-16 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 to-transparent z-10 pointer-events-none" />
                        <div className="glass-card p-2 rounded-2xl overflow-hidden shadow-2xl shadow-primary-500/10">
                            <div className="bg-dark-900 rounded-xl p-8">
                                {/* Mock Interview Interface */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                                                <MessageSquare className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-dark-400">AI Interviewer</p>
                                                <p className="text-white">Technical Interview</p>
                                            </div>
                                        </div>
                                        <div className="glass-card p-4">
                                            <p className="text-dark-200">
                                                "Can you explain the difference between a stack and a queue?
                                                Please provide examples of when you would use each data structure."
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-dark-400">
                                            <span className="badge-primary">Medium Difficulty</span>
                                            <span>Question 3 of 10</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="glass-card p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm text-dark-400">Your Score</span>
                                                <span className="text-2xl font-bold text-success-400">87%</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-dark-400">Correctness</span>
                                                    <span className="text-white">90%</span>
                                                </div>
                                                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                                    <div className="h-full w-[90%] bg-success-500 rounded-full" />
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-dark-400">Communication</span>
                                                    <span className="text-white">82%</span>
                                                </div>
                                                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                                    <div className="h-full w-[82%] bg-primary-500 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 border-y border-dark-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-dark-400">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold mb-4">
                            Everything You Need to{' '}
                            <span className="gradient-text">Ace Your Interview</span>
                        </h2>
                        <p className="text-xl text-dark-400 max-w-2xl mx-auto">
                            Our AI-powered platform provides comprehensive tools to prepare you for any interview scenario.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card-hover p-6"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-primary-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-dark-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-card p-12 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10" />
                        <div className="relative z-10">
                            <Award className="w-16 h-16 text-primary-400 mx-auto mb-6" />
                            <h2 className="text-4xl font-bold mb-4">
                                Ready to Nail Your Next Interview?
                            </h2>
                            <p className="text-xl text-dark-300 mb-8 max-w-xl mx-auto">
                                Join thousands of candidates who have improved their interview skills with our AI-powered platform.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                                    Start Free Today
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-dark-400">
                                <span className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-success-400" />
                                    5 Free Interviews
                                </span>
                                <span className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-success-400" />
                                    No Credit Card
                                </span>
                                <span className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-success-400" />
                                    Cancel Anytime
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-dark-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-display font-bold gradient-text">AI Interviewer</span>
                        </div>
                        <p className="text-dark-500 text-sm">
                            © 2024 AI Interviewer. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
