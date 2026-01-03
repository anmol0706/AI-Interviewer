import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import NewInterview from './pages/interview/NewInterview';
import InterviewRoom from './pages/interview/InterviewRoom';
import InterviewReport from './pages/interview/InterviewReport';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import DailyPractice from './pages/DailyPractice';
import Achievements from './pages/Achievements';

// Protected Route wrapper
function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-dark-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Public Route wrapper (redirect to dashboard if authenticated)
function PublicRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-950">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/interview/new" element={<NewInterview />} />
                <Route path="/interview/:sessionId" element={<InterviewRoom />} />
                <Route path="/interview/:sessionId/report" element={<InterviewReport />} />
                <Route path="/history" element={<History />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/daily-practice" element={<DailyPractice />} />
                <Route path="/achievements" element={<Achievements />} />
            </Route>

            {/* 404 */}
            <Route
                path="*"
                element={
                    <div className="min-h-screen flex items-center justify-center bg-dark-950">
                        <div className="text-center">
                            <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
                            <p className="text-dark-400 mb-8">Page not found</p>
                            <a href="/" className="btn-primary">Go Home</a>
                        </div>
                    </div>
                }
            />
        </Routes>
    );
}

export default App;
