import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const passwordRequirements = [
        { text: 'At least 8 characters', met: formData.password.length >= 8 },
        { text: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
        { text: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
        { text: 'One number', met: /\d/.test(formData.password) }
    ];

    const allRequirementsMet = passwordRequirements.every(r => r.met);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!allRequirementsMet) {
            toast.error('Please meet all password requirements');
            return;
        }

        setIsLoading(true);

        try {
            await register(formData);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
                <p className="text-dark-400">Start your AI-powered interview practice</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="label">First Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                            <input
                                id="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="input pl-12"
                                placeholder="John"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="lastName" className="label">Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="input"
                            placeholder="Doe"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="label">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input pl-12"
                            placeholder="you@example.com"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="label">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input pl-12 pr-12"
                            placeholder="Create a password"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Password Requirements */}
                    {formData.password && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 space-y-2"
                        >
                            {passwordRequirements.map((req, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center gap-2 text-sm ${req.met ? 'text-success-400' : 'text-dark-400'
                                        }`}
                                >
                                    <Check className={`w-4 h-4 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                                    <span>{req.text}</span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Terms */}
                <p className="text-sm text-dark-400">
                    By signing up, you agree to our{' '}
                    <a href="#" className="text-primary-400 hover:text-primary-300">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>
                </p>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    disabled={isLoading || !allRequirementsMet}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full py-4"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Create Account
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </motion.button>
            </form>

            {/* Login Link */}
            <p className="text-center text-dark-400 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
