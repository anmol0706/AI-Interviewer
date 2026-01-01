import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import {
    LayoutDashboard,
    MessageSquarePlus,
    History,
    BarChart3,
    Settings,
    LogOut,
    ChevronLeft,
    Menu,
    X,
    Sparkles,
    User,
    Flame
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/daily-practice', icon: Flame, label: 'Daily Practice' },
    { path: '/interview/new', icon: MessageSquarePlus, label: 'New Interview' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-dark-950 flex">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarCollapsed ? 80 : 280 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-dark-900/80 backdrop-blur-xl border-r border-dark-800 z-50"
            >
                {/* Logo */}
                <div className="p-6 flex items-center justify-between">
                    {!sidebarCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-display text-xl font-bold gradient-text">
                                AI Interviewer
                            </span>
                        </motion.div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
                    >
                        <ChevronLeft
                            className={`w-5 h-5 text-dark-400 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''
                                }`}
                        />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                                } ${sidebarCollapsed ? 'justify-center' : ''}`
                            }
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!sidebarCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-medium"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-dark-800">
                    <div
                        className={`flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 ${sidebarCollapsed ? 'justify-center' : ''
                            }`}
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.fullName}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <User className="w-5 h-5 text-white" />
                            )}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.fullName}
                                </p>
                                <p className="text-xs text-dark-400 truncate">{user?.email}</p>
                            </div>
                        )}
                        {!sidebarCollapsed && (
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-lg text-dark-400 hover:text-error-500 hover:bg-dark-700 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-12 bg-dark-950/90 backdrop-blur-xl border-b border-dark-800/30 z-50 flex items-center justify-between px-3 safe-area-padding">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-display font-bold text-sm gradient-text tracking-tight">
                        AI Interviewer
                    </span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-1.5 rounded-lg hover:bg-dark-800 active:bg-dark-700 min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                    {mobileMenuOpen ? (
                        <X className="w-5 h-5 text-white" />
                    ) : (
                        <Menu className="w-5 h-5 text-white" />
                    )}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="lg:hidden fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: mobileMenuOpen ? 0 : '100%' }}
                transition={{ type: 'spring', damping: 20 }}
                className="lg:hidden fixed right-0 top-0 bottom-0 w-[75%] max-w-[260px] bg-dark-900/95 backdrop-blur-xl border-l border-dark-800/50 z-50 pt-14 safe-area-padding"
            >
                <nav className="px-3 py-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${isActive
                                    ? 'bg-primary-500/15 text-primary-400'
                                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                                }`
                            }
                        >
                            <item.icon className="w-4 h-4" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </NavLink>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-error-500 hover:bg-error-500/10 transition-all mt-3"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </nav>
            </motion.div>

            {/* Main Content */}
            <main
                className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'
                    } pt-12 lg:pt-0`}
            >
                <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 safe-area-padding">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
