import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden safe-area-padding">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-40 sm:w-64 md:w-80 h-40 sm:h-64 md:h-80 bg-primary-500/15 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-64 md:w-80 h-40 sm:h-64 md:h-80 bg-secondary-500/15 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm sm:max-w-md relative z-10"
            >
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 mb-5 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="font-display text-lg sm:text-xl font-bold gradient-text tracking-tight">
                        AI Interviewer
                    </span>
                </Link>

                {/* Auth Form Container */}
                <div className="bg-dark-900/80 backdrop-blur-sm rounded-xl border border-dark-800/50 p-4 sm:p-5 md:p-6">
                    <Outlet />
                </div>

                {/* Footer */}
                <p className="text-center text-dark-500 text-[10px] sm:text-xs mt-4">
                    © 2024 AI Interviewer. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}
