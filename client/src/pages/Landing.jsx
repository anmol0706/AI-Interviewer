import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, Zap, Target, Trophy, ArrowRight, Brain, MessageSquare, BarChart3, Clock, Shield, TrendingUp, UserPlus, PlayCircle, CheckCircle, Award, Home, Layers, Star, Quote } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import TestimonialCard from '../components/TestimonialCard';
import GDGLogo from '../components/GDGLogo';

const Landing = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [visibleSteps, setVisibleSteps] = useState({
        step1: false,
        step2: false,
        step3: false,
        step4: false,
    });
    const navigate = useNavigate();

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Intersection Observer for individual steps animation
    useEffect(() => {
        const observerOptions = {
            threshold: 0.3, // Trigger when 30% of the step is visible
            rootMargin: '0px 0px -100px 0px', // Trigger slightly before reaching viewport
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const stepId = entry.target.getAttribute('data-step');
                    if (stepId) {
                        setVisibleSteps((prev) => ({
                            ...prev,
                            [stepId]: true,
                        }));
                    }
                }
            });
        }, observerOptions);

        // Observe each step
        const steps = ['step1', 'step2', 'step3', 'step4'];
        steps.forEach((stepId) => {
            const stepElement = document.querySelector(`[data-step="${stepId}"]`);
            if (stepElement) {
                observer.observe(stepElement);
            }
        });

        return () => {
            steps.forEach((stepId) => {
                const stepElement = document.querySelector(`[data-step="${stepId}"]`);
                if (stepElement) {
                    observer.unobserve(stepElement);
                }
            });
        };
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    const testimonials = [
        {
            id: 1,
            name: 'Sarah Kim',
            role: 'Software Engineer',
            initials: 'SK',
            text: 'This platform completely transformed my interview skills. The AI feedback was incredibly detailed and helped me identify areas I never knew I needed to improve.',
            avatarGradient: 'from-primary-500 to-primary-600',
            borderColor: 'primary'
        },
        {
            id: 2,
            name: 'Michael Patel',
            role: 'Product Manager',
            initials: 'MP',
            text: 'I landed my dream job after just 2 weeks of practice! The adaptive difficulty kept me challenged and the analytics showed exactly where to focus my efforts.',
            avatarGradient: 'from-secondary-500 to-secondary-600',
            borderColor: 'secondary'
        },
        {
            id: 3,
            name: 'Emily Chen',
            role: 'Data Scientist',
            initials: 'EC',
            text: 'The real-time feedback is a game-changer. It\'s like having a personal interview coach available 24/7. My confidence has skyrocketed!',
            avatarGradient: 'from-primary-500 to-secondary-600',
            borderColor: 'primary'
        },
        {
            id: 4,
            name: 'James Rodriguez',
            role: 'UX Designer',
            initials: 'JR',
            text: 'Best investment in my career. The AI asks questions I wouldn\'t have thought to prepare for, and the performance tracking keeps me motivated.',
            avatarGradient: 'from-secondary-500 to-primary-600',
            borderColor: 'secondary'
        },
        {
            id: 5,
            name: 'Aisha Noor',
            role: 'Marketing Manager',
            initials: 'AN',
            text: 'As someone who struggled with interview anxiety, this platform was exactly what I needed. The practice sessions helped me feel prepared and confident.',
            avatarGradient: 'from-primary-600 to-primary-500',
            borderColor: 'primary'
        },
        {
            id: 6,
            name: 'David Lee',
            role: 'Business Analyst',
            initials: 'DL',
            text: 'Phenomenal platform! The variety of questions and instant feedback helped me ace multiple interviews. Highly recommend to anyone serious about career growth.',
            avatarGradient: 'from-secondary-600 to-secondary-500',
            borderColor: 'secondary'
        }
    ];

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Testimonials', href: '#testimonials' },
    ];

    return (
        <div className="min-h-screen bg-dark-950 text-white pb-safe">
            {/* Navigation Bar */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50 shadow-lg'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
                        {/* Logo */}
                        <Link
                            to="/"
                            className="flex items-center gap-1.5 sm:gap-2 group transition-transform duration-300 hover:scale-105"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 p-1.5 sm:p-2 rounded-lg">
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                            </div>
                            <span className="text-sm sm:text-lg md:text-xl font-bold bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 bg-clip-text text-transparent">
                                AI Interviewer
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1 lg:gap-2">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="px-3 lg:px-4 py-2 text-sm lg:text-base text-dark-300 hover:text-white transition-all duration-200 rounded-lg hover:bg-dark-800/50 relative group"
                                >
                                    {link.name}
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:w-3/4 transition-all duration-300"></span>
                                </a>
                            ))}
                        </div>

                        {/* Desktop CTA Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-3 py-1.5 text-xs lg:text-sm text-dark-200 hover:text-white transition-colors duration-200"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="relative group px-3 py-2 rounded-lg font-medium text-xs lg:text-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 transition-all duration-300 group-hover:from-primary-500 group-hover:to-secondary-500"></div>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 blur-xl"></div>
                                </div>
                                <span className="relative flex items-center gap-2 text-white">
                                    Get Started
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800/50 transition-all duration-200 touch-target"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <GDGLogo className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen
                        ? 'max-h-screen opacity-100'
                        : 'max-h-0 opacity-0 overflow-hidden'
                        }`}
                >
                    <div className="px-3 sm:px-4 pt-2 pb-6 space-y-1 bg-dark-900/95 backdrop-blur-xl border-b border-dark-700/50">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-3 text-sm sm:text-base text-dark-300 hover:text-white hover:bg-dark-800/70 rounded-lg transition-all duration-200 touch-target"
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="pt-4 space-y-2 border-t border-dark-700/50 mt-4">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    navigate('/login');
                                }}
                                className="w-full px-4 py-3 text-center text-sm sm:text-base text-dark-200 hover:text-white hover:bg-dark-800/70 rounded-lg transition-all duration-200 touch-target"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    navigate('/register');
                                }}
                                className="w-full px-4 py-3 text-center text-sm sm:text-base bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium hover:from-primary-500 hover:to-secondary-500 transition-all duration-200 touch-target shadow-lg"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
                {/* Animated Background Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-20">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-4 sm:mb-6 md:mb-8 rounded-full bg-primary-500/10 border border-primary-500/30 backdrop-blur-sm">
                            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400" />
                            <span className="text-[10px] sm:text-xs md:text-sm text-primary-300 font-medium">
                                AI-Powered Interview Practice
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                            Master Your Interview Skills with{' '}
                            <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 bg-clip-text text-transparent">
                                AI Precision
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-dark-300 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
                            Practice like never before with adaptive AI that learns from your responses,
                            provides real-time feedback, and helps you ace every interview.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 sm:mb-12 md:mb-16 px-2">
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full sm:w-auto group relative px-5 py-2.5 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600"></div>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 blur-2xl"></div>
                                </div>
                                <span className="relative flex items-center justify-center gap-1.5 sm:gap-2 text-white">
                                    Start Free Trial
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </button>

                            <button
                                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full sm:w-auto px-5 py-2.5 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg border-2 border-dark-600 hover:border-primary-500/50 bg-dark-800/50 backdrop-blur-sm hover:bg-dark-700/50 transition-all duration-300"
                            >
                                See How It Works
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 max-w-3xl mx-auto px-2">
                            <div className="glass-card p-2 sm:p-4 md:p-6 text-center">
                                <div className="flex items-center justify-center mb-1 sm:mb-2">
                                    <Target className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary-400" />
                                </div>
                                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1">95%</div>
                                <div className="text-[9px] sm:text-xs md:text-sm text-dark-400">Success Rate</div>
                            </div>

                            <div className="glass-card p-2 sm:p-4 md:p-6 text-center">
                                <div className="flex items-center justify-center mb-1 sm:mb-2">
                                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-secondary-400" />
                                </div>
                                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1">10K+</div>
                                <div className="text-[9px] sm:text-xs md:text-sm text-dark-400">Users</div>
                            </div>

                            <div className="glass-card p-2 sm:p-4 md:p-6 text-center">
                                <div className="flex items-center justify-center mb-1 sm:mb-2">
                                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary-400" />
                                </div>
                                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1">50K+</div>
                                <div className="text-[9px] sm:text-xs md:text-sm text-dark-400">Interviews</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Marquee Section (Skipper UI Style) */}
            <div className="w-full py-8 border-y border-dark-800/50 bg-dark-900/30 overflow-hidden mb-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm text-dark-400 mb-6 font-medium tracking-wider">TRUSTED BY CANDIDATES FROM INNOVATIVE COMPANIES</p>
                    <div className="relative flex overflow-x-hidden group">
                        <div className="animate-marquee whitespace-nowrap flex gap-12 sm:gap-16 items-center">
                            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'Uber', 'Airbnb', 'Adobe', 'Salesforce'].map((company) => (
                                <span key={company} className="text-lg sm:text-xl md:text-2xl font-bold text-dark-600 hover:text-dark-300 transition-colors cursor-default select-none">
                                    {company}
                                </span>
                            ))}
                        </div>
                        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-12 sm:gap-16 items-center">
                            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'Uber', 'Airbnb', 'Adobe', 'Salesforce'].map((company) => (
                                <span key={company} className="text-lg sm:text-xl md:text-2xl font-bold text-dark-600 hover:text-dark-300 transition-colors cursor-default select-none">
                                    {company}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section id="features" className="relative py-8 sm:py-16 md:py-24 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-8 sm:mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-3 sm:mb-4 rounded-full bg-secondary-500/10 border border-secondary-500/30 backdrop-blur-sm">
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-400" />
                            <span className="text-[10px] sm:text-xs md:text-sm text-secondary-300 font-medium">
                                Powerful Features
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                            Everything You Need to{' '}
                            <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 bg-clip-text text-transparent">
                                Ace Interviews
                            </span>
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-dark-300 max-w-2xl mx-auto px-2">
                            Our AI-powered platform provides comprehensive tools and insights to help you excel in your next interview
                        </p>
                    </div>

                    {/* Features Bento Grid (Skipper UI Style) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]">
                        {/* Feature 1 - Large (2 cols) */}
                        <div className="md:col-span-2 group glass-card p-4 sm:p-6 md:p-8 hover:border-primary-500/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="inline-flex p-3 rounded-xl bg-primary-500/10 mb-4 text-primary-400 group-hover:scale-110 transition-transform duration-300">
                                    <Brain className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Smart AI Analysis</h3>
                                <p className="text-sm text-dark-300 max-w-md">Our advanced AI analyzes not just your words, but your tone, pacing, and confidence to provide holistic feedback similar to a human interviewer.</p>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 md:opacity-20 translate-x-1/4 translate-y-1/4">
                                <Brain className="w-48 h-48 md:w-64 md:h-64 text-primary-500" />
                            </div>
                        </div>

                        {/* Feature 2 - Tall (1 col, 2 rows) */}
                        <div className="md:row-span-2 group glass-card p-4 sm:p-6 md:p-8 hover:border-secondary-500/30 transition-all duration-300 relative overflow-hidden flex flex-col min-h-[220px]">
                            <div className="absolute inset-0 bg-gradient-to-b from-secondary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="inline-flex p-3 rounded-xl bg-secondary-500/10 mb-4 text-secondary-400 group-hover:scale-110 transition-transform duration-300">
                                    <BarChart3 className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Detailed Analytics</h3>
                                <p className="text-sm text-dark-300 mb-6">Track your progress over time with comprehensive charts showing your improvement in various skills.</p>

                                {/* Analytics Graphic Placeholder */}
                                <div className="mt-auto relative h-32 w-full bg-dark-900/50 rounded-lg overflow-hidden border border-dark-700/50 p-2">
                                    <div className="flex items-end justify-between h-full gap-1">
                                        {[40, 60, 45, 75, 60, 85, 90].map((h, i) => (
                                            <div key={i} className="w-full bg-secondary-500/30 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 - Standard */}
                        <div className="group glass-card p-4 sm:p-6 hover:border-primary-500/30 transition-all duration-300 relative overflow-hidden min-h-[200px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="inline-flex p-3 rounded-xl bg-primary-500/10 mb-4 text-primary-400">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Real-time Feedback</h3>
                                <p className="text-sm text-dark-300">Get instant corrections and suggestions while you speak.</p>
                            </div>
                        </div>

                        {/* Feature 4 - Standard */}
                        <div className="group glass-card p-4 sm:p-6 hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden min-h-[200px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="inline-flex p-3 rounded-xl bg-purple-500/10 mb-4 text-purple-400">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Private & Secure</h3>
                                <p className="text-sm text-dark-300">Your practice sessions are encrypted and private to you.</p>
                            </div>
                        </div>

                        {/* Feature 5 - Wide (2 cols) */}
                        <div className="md:col-span-2 group glass-card p-4 sm:p-6 md:p-8 hover:border-sky-500/30 transition-all duration-300 relative overflow-hidden flex items-center min-h-[180px]">
                            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center">
                                <div>
                                    <div className="inline-flex p-3 rounded-xl bg-sky-500/10 mb-4 text-sky-400">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Adaptive Difficulty</h3>
                                    <p className="text-sm text-dark-300">Questions get harder as you improve, ensuring you're always challenged at the right level.</p>
                                </div>
                                <div className="bg-dark-900/50 rounded-lg p-4 border border-dark-700/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">Easy</div>
                                        <div className="h-1 flex-1 bg-dark-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-xs">Med</div>
                                        <div className="h-1 flex-1 bg-dark-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-500 w-2/3"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs">Hard</div>
                                        <div className="h-1 flex-1 bg-dark-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 w-1/3"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA at bottom of features */}
                    <div className="text-center mt-8 sm:mt-12 md:mt-16">
                        <button
                            onClick={() => navigate('/register')}
                            className="group inline-flex items-center gap-2 px-5 py-2.5 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
                        >
                            Start Practicing Now
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="relative py-12 sm:py-16 md:py-24 bg-dark-900/30 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-8 sm:mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-3 sm:mb-4 rounded-full bg-primary-500/10 border border-primary-500/30 backdrop-blur-sm">
                            <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400" />
                            <span className="text-[10px] sm:text-xs md:text-sm text-primary-300 font-medium">
                                Simple Process
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                            Get Started in{' '}
                            <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 bg-clip-text text-transparent">
                                4 Easy Steps
                            </span>
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-dark-300 max-w-2xl mx-auto px-2">
                            Start your interview preparation journey today and see results immediately
                        </p>
                    </div>

                    {/* Steps Flow */}
                    <div className="relative max-w-5xl mx-auto">
                        {/* Connecting Line - Hidden on mobile, visible on larger screens */}
                        <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-500/20"></div>

                        {/* Steps Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                            {/* Step 1: Sign Up */}
                            <div
                                data-step="step1"
                                className={`relative group ${visibleSteps.step1 ? 'step-animate step-animate-1' : 'opacity-0'}`}
                            >
                                <div className="glass-card p-4 sm:p-6 text-center hover:border-primary-500/30 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="relative">
                                        {/* Step Number */}
                                        <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg">
                                            1
                                        </div>

                                        {/* Icon */}
                                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 group-hover:from-primary-500/30 group-hover:to-primary-600/30 transition-all duration-300 mb-3 sm:mb-4">
                                            <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary-400" />
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2">
                                            Create Account
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs sm:text-sm text-dark-300 leading-relaxed">
                                            Sign up for free in seconds with your email
                                        </p>
                                    </div>
                                </div>

                                {/* Arrow for larger screens */}
                                <div className="hidden lg:block absolute top-1/3 -right-4 z-10">
                                    <ArrowRight className="w-8 h-8 text-primary-500/30" />
                                </div>
                            </div>

                            {/* Step 2: Choose Interview */}
                            <div
                                data-step="step2"
                                className={`relative group ${visibleSteps.step2 ? 'step-animate step-animate-2' : 'opacity-0'}`}
                            >
                                <div className="glass-card p-4 sm:p-6 text-center hover:border-secondary-500/30 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="relative">
                                        {/* Step Number */}
                                        <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-secondary-600 to-secondary-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg">
                                            2
                                        </div>

                                        {/* Icon */}
                                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 group-hover:from-secondary-500/30 group-hover:to-secondary-600/30 transition-all duration-300 mb-3 sm:mb-4">
                                            <Target className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-secondary-400" />
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2">
                                            Choose Interview
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs sm:text-sm text-dark-300 leading-relaxed">
                                            Select your role and difficulty level
                                        </p>
                                    </div>
                                </div>

                                {/* Arrow for larger screens */}
                                <div className="hidden lg:block absolute top-1/3 -right-4 z-10">
                                    <ArrowRight className="w-8 h-8 text-secondary-500/30" />
                                </div>
                            </div>

                            {/* Step 3: Practice */}
                            <div
                                data-step="step3"
                                className={`relative group ${visibleSteps.step3 ? 'step-animate step-animate-3' : 'opacity-0'}`}
                            >
                                <div className="glass-card p-4 sm:p-6 text-center hover:border-primary-500/30 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="relative">
                                        {/* Step Number */}
                                        <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg">
                                            3
                                        </div>

                                        {/* Icon */}
                                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-600/20 group-hover:from-primary-500/30 group-hover:to-secondary-600/30 transition-all duration-300 mb-3 sm:mb-4">
                                            <Brain className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary-400" />
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2">
                                            Practice Interview
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs sm:text-sm text-dark-300 leading-relaxed">
                                            Answer AI-generated questions in real-time
                                        </p>
                                    </div>
                                </div>

                                {/* Arrow for larger screens */}
                                <div className="hidden lg:block absolute top-1/3 -right-4 z-10">
                                    <ArrowRight className="w-8 h-8 text-primary-500/30" />
                                </div>
                            </div>

                            {/* Step 4: Review Results */}
                            <div
                                data-step="step4"
                                className={`relative group ${visibleSteps.step4 ? 'step-animate step-animate-4' : 'opacity-0'}`}
                            >
                                <div className="glass-card p-4 sm:p-6 text-center hover:border-secondary-500/30 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="relative">
                                        {/* Step Number */}
                                        <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-secondary-600 to-primary-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg">
                                            4
                                        </div>

                                        {/* Icon */}
                                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-secondary-500/20 to-primary-600/20 group-hover:from-secondary-500/30 group-hover:to-primary-600/30 transition-all duration-300 mb-3 sm:mb-4">
                                            <Award className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-secondary-400" />
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2">
                                            Review & Improve
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs sm:text-sm text-dark-300 leading-relaxed">
                                            Get detailed feedback and track progress
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="text-center mt-8 sm:mt-12 md:mt-16">
                        <p className="text-xs sm:text-sm md:text-base text-dark-300 mb-4 sm:mb-6">
                            Join thousands of users who are already improving their interview skills
                        </p>
                        <button
                            onClick={() => navigate('/register')}
                            className="group inline-flex items-center gap-2 px-5 py-2.5 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
                        >
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            Start Your Journey
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            </section>


            {/* Testimonials Section */}
            <section id="testimonials" className="hidden sm:block relative py-12 sm:py-16 md:py-24 bg-dark-900/30 pb-20 md:pb-0 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bottom-1/3 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="hidden sm:block text-center mb-8 sm:mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-3 sm:mb-4 rounded-full bg-secondary-500/10 border border-secondary-500/30 backdrop-blur-sm">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-400 fill-secondary-400" />
                            <span className="text-[10px] sm:text-xs md:text-sm text-secondary-300 font-medium">
                                User Reviews
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                            Loved by{' '}
                            <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 bg-clip-text text-transparent">
                                Thousands of Users
                            </span>
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-dark-300 max-w-2xl mx-auto px-2">
                            See what our users have to say about their interview preparation journey
                        </p>
                    </div>

                    {/* Testimonials Swiper Carousel */}
                    <Swiper
                        modules={[Pagination, Autoplay, EffectCoverflow]}
                        effect="coverflow"
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView="auto"
                        coverflowEffect={{
                            rotate: 50,
                            stretch: 0,
                            depth: 100,
                            modifier: 1,
                            slideShadows: true,
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        loop={true}
                        breakpoints={{
                            320: {
                                slidesPerView: 1,
                                spaceBetween: 20,
                                effect: 'slide',
                                centeredSlides: true,
                            },
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 30,
                                effect: 'slide',
                                centeredSlides: false,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 40,
                                effect: 'coverflow',
                                centeredSlides: true,
                            },
                        }}
                        className="testimonials-swiper !pb-12"
                    >
                        {testimonials.map((testimonial) => (
                            <SwiperSlide key={testimonial.id} className="!h-auto">
                                <TestimonialCard
                                    testimonial={testimonial}
                                    gradient={testimonial.borderColor}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>


                    {/* Bottom CTA */}
                    <div className="text-center mt-8 sm:mt-12 md:mt-16">
                        <p className="text-xs sm:text-sm md:text-base text-dark-300 mb-4 sm:mb-6">
                            Join our community and start your success story today
                        </p>
                        <button
                            onClick={() => navigate('/register')}
                            className="group inline-flex items-center gap-2 px-5 py-2.5 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
                        >
                            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                            Start Your Success Story
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer (Skipper UI Style) */}
            <footer className="bg-dark-900 border-t border-dark-800 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Brand & Copyright */}
                    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-primary-500" />
                            <span className="text-lg font-bold text-white">AI Interviewer</span>
                        </div>
                        <span className="hidden md:inline text-dark-600">|</span>
                        <p className="text-sm text-dark-400">© 2024 All rights reserved.</p>
                    </div>

                    {/* Socials & Links */}
                    <div className="flex items-center gap-6">
                        <div className="flex gap-4">
                            {[
                                { icon: 'twitter', label: 'Twitter' },
                                { icon: 'github', label: 'GitHub' },
                                { icon: 'linkedin', label: 'LinkedIn' }
                            ].map((social) => (
                                <a key={social.label} href="#" className="text-dark-400 hover:text-white transition-colors">
                                    <span className="sr-only">{social.label}</span>
                                    <div className="w-5 h-5 rounded-full border border-current opacity-70"></div>
                                </a>
                            ))}
                        </div>
                        <div className="h-4 w-px bg-dark-700 hidden sm:block"></div>
                        <div className="flex gap-4 text-sm text-dark-400">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Mobile Bottom Navigation - Only visible on mobile/tablet */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-xl border-t border-dark-700/50 pb-safe">
                <div className="grid grid-cols-4 gap-1 px-2 py-1.5">
                    {/* Home/Top */}
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg hover:bg-dark-800/50 active:bg-dark-800 transition-all duration-200 touch-target"
                    >
                        <Home className="w-4 h-4 text-dark-400" />
                        <span className="text-[9px] text-dark-400 font-medium">Home</span>
                    </button>

                    {/* Features */}
                    <button
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg hover:bg-dark-800/50 active:bg-dark-800 transition-all duration-200 touch-target"
                    >
                        <Layers className="w-4 h-4 text-dark-400" />
                        <span className="text-[9px] text-dark-400 font-medium">Features</span>
                    </button>

                    {/* How It Works */}
                    <button
                        onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg hover:bg-dark-800/50 active:bg-dark-800 transition-all duration-200 touch-target"
                    >
                        <PlayCircle className="w-4 h-4 text-dark-400" />
                        <span className="text-[9px] text-dark-400 font-medium">Steps</span>
                    </button>


                    {/* Get Started CTA */}
                    <button
                        onClick={() => navigate('/register')}
                        className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 active:scale-95 transition-all duration-200 touch-target shadow-lg"
                    >
                        <Sparkles className="w-4 h-4 text-white" />
                        <span className="text-[9px] text-white font-bold">Start</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

// End of component
export default Landing;
