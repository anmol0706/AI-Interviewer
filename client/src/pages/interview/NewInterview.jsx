import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { useInterviewStore } from '../../stores/interviewStore';
import { interviewService } from '../../services/interviewService';
import toast from 'react-hot-toast';
import {
    Code2,
    Users,
    Brain,
    Layers,
    Zap,
    Smile,
    Briefcase,
    Mic,
    MicOff,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Target,
    Building2,
    HelpCircle
} from 'lucide-react';

const interviewTypes = [
    {
        id: 'technical',
        name: 'Technical',
        description: 'Data structures, algorithms, coding problems',
        icon: Code2,
        color: 'from-blue-500 to-cyan-500',
        subCategories: ['JavaScript', 'Python', 'React', 'Node.js', 'Algorithms', 'System Fundamentals']
    },
    {
        id: 'behavioral',
        name: 'Behavioral',
        description: 'Leadership, teamwork, conflict resolution',
        icon: Users,
        color: 'from-purple-500 to-pink-500',
        subCategories: ['Leadership', 'Teamwork', 'Conflict Resolution', 'Time Management']
    },
    {
        id: 'system-design',
        name: 'System Design',
        description: 'Architecture, scalability, trade-offs',
        icon: Layers,
        color: 'from-orange-500 to-red-500',
        subCategories: ['Distributed Systems', 'Databases', 'API Design', 'Scalability']
    },
    {
        id: 'hr',
        name: 'HR',
        description: 'Career goals, company fit, expectations',
        icon: Briefcase,
        color: 'from-green-500 to-emerald-500',
        subCategories: ['Career Goals', 'Company Fit', 'Salary Negotiation']
    }
];

const personalities = [
    { id: 'strict', name: 'Strict', icon: Zap, description: 'FAANG-style rigorous interviewer' },
    { id: 'friendly', name: 'Friendly', icon: Smile, description: 'Supportive and encouraging' },
    { id: 'professional', name: 'Professional', icon: Briefcase, description: 'Balanced corporate style' }
];

const difficulties = [
    { id: 'easy', name: 'Easy', description: 'Fundamentals & basics' },
    { id: 'medium', name: 'Medium', description: 'Standard interview level' },
    { id: 'hard', name: 'Hard', description: 'Advanced challenges' },
    { id: 'expert', name: 'Expert', description: 'FAANG+ level difficulty' }
];

export default function NewInterview() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuthStore();
    const { setSession, initSocket } = useInterviewStore();

    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({
        interviewType: searchParams.get('type') || 'technical',
        subCategory: '',
        personality: user?.preferences?.interviewerPersonality || 'professional',
        difficulty: user?.preferences?.difficultyLevel || 'medium',
        targetCompany: '',
        targetRole: '',
        voiceEnabled: user?.preferences?.voiceEnabled ?? true,
        totalQuestions: 10
    });

    const startMutation = useMutation({
        mutationFn: interviewService.startInterview,
        onSuccess: (data) => {
            setSession(data.data);
            initSocket();
            navigate(`/interview/${data.data.sessionId}`);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to start interview');
        }
    });

    const selectedType = interviewTypes.find(t => t.id === config.interviewType);

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            startMutation.mutate(config);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${s === step
                                    ? 'bg-primary-500 text-white'
                                    : s < step
                                        ? 'bg-success-500 text-white'
                                        : 'bg-dark-700 text-dark-400'
                                }`}
                        >
                            {s < step ? '✓' : s}
                        </div>
                        {s < 3 && (
                            <div
                                className={`w-20 h-1 mx-2 rounded ${s < step ? 'bg-success-500' : 'bg-dark-700'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Select Type */}
            {step === 1 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <h1 className="text-3xl font-bold text-white text-center mb-2">
                        Choose Interview Type
                    </h1>
                    <p className="text-dark-400 text-center mb-8">
                        Select the type of interview you want to practice
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        {interviewTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setConfig({ ...config, interviewType: type.id })}
                                className={`p-6 rounded-2xl text-left transition-all ${config.interviewType === type.id
                                        ? 'glass-card border-primary-500/50 shadow-glow-sm'
                                        : 'glass-card border-transparent hover:border-dark-600'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                                    <type.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-1">{type.name}</h3>
                                <p className="text-dark-400 text-sm">{type.description}</p>
                            </button>
                        ))}
                    </div>

                    {/* Sub Categories */}
                    {selectedType && (
                        <div className="glass-card p-6 mb-8">
                            <h4 className="text-sm font-medium text-dark-400 mb-3">Focus Area (Optional)</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedType.subCategories.map((sub) => (
                                    <button
                                        key={sub}
                                        onClick={() => setConfig({ ...config, subCategory: config.subCategory === sub ? '' : sub })}
                                        className={`px-4 py-2 rounded-lg text-sm transition-all ${config.subCategory === sub
                                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                                                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                                            }`}
                                    >
                                        {sub}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Step 2: Configure Settings */}
            {step === 2 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <h1 className="text-3xl font-bold text-white text-center mb-2">
                        Configure Your Interview
                    </h1>
                    <p className="text-dark-400 text-center mb-8">
                        Customize the interview experience
                    </p>

                    {/* Interviewer Personality */}
                    <div className="mb-8">
                        <h4 className="text-lg font-medium text-white mb-4">Interviewer Style</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                            {personalities.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setConfig({ ...config, personality: p.id })}
                                    className={`p-4 rounded-xl text-left transition-all ${config.personality === p.id
                                            ? 'glass-card border-primary-500/50'
                                            : 'bg-dark-800/50 hover:bg-dark-800'
                                        }`}
                                >
                                    <p.icon className={`w-6 h-6 mb-2 ${config.personality === p.id ? 'text-primary-400' : 'text-dark-400'}`} />
                                    <h5 className="font-medium text-white">{p.name}</h5>
                                    <p className="text-dark-400 text-sm">{p.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="mb-8">
                        <h4 className="text-lg font-medium text-white mb-4">Starting Difficulty</h4>
                        <div className="grid grid-cols-4 gap-3">
                            {difficulties.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => setConfig({ ...config, difficulty: d.id })}
                                    className={`p-4 rounded-xl text-center transition-all ${config.difficulty === d.id
                                            ? 'glass-card border-primary-500/50'
                                            : 'bg-dark-800/50 hover:bg-dark-800'
                                        }`}
                                >
                                    <p className="font-medium text-white">{d.name}</p>
                                    <p className="text-dark-500 text-xs mt-1">{d.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Voice Toggle */}
                    <div className="glass-card p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {config.voiceEnabled ? (
                                    <Mic className="w-6 h-6 text-primary-400" />
                                ) : (
                                    <MicOff className="w-6 h-6 text-dark-400" />
                                )}
                                <div>
                                    <h5 className="font-medium text-white">Voice Interview</h5>
                                    <p className="text-dark-400 text-sm">Answer questions using your microphone</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setConfig({ ...config, voiceEnabled: !config.voiceEnabled })}
                                className={`w-14 h-8 rounded-full transition-all ${config.voiceEnabled ? 'bg-primary-500' : 'bg-dark-600'
                                    }`}
                            >
                                <div
                                    className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${config.voiceEnabled ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 3: Target Company (Optional) */}
            {step === 3 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <h1 className="text-3xl font-bold text-white text-center mb-2">
                        Target Position (Optional)
                    </h1>
                    <p className="text-dark-400 text-center mb-8">
                        Customize questions for your dream role
                    </p>

                    <div className="glass-card p-6 space-y-6 mb-8">
                        <div>
                            <label className="label flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Target Company
                            </label>
                            <input
                                type="text"
                                value={config.targetCompany}
                                onChange={(e) => setConfig({ ...config, targetCompany: e.target.value })}
                                className="input"
                                placeholder="e.g., Google, Amazon, Meta"
                            />
                        </div>

                        <div>
                            <label className="label flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Target Role
                            </label>
                            <input
                                type="text"
                                value={config.targetRole}
                                onChange={(e) => setConfig({ ...config, targetRole: e.target.value })}
                                className="input"
                                placeholder="e.g., Senior Software Engineer"
                            />
                        </div>

                        <div>
                            <label className="label flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" />
                                Number of Questions
                            </label>
                            <select
                                value={config.totalQuestions}
                                onChange={(e) => setConfig({ ...config, totalQuestions: parseInt(e.target.value) })}
                                className="input"
                            >
                                <option value={5}>5 Questions (~15 min)</option>
                                <option value={10}>10 Questions (~30 min)</option>
                                <option value={15}>15 Questions (~45 min)</option>
                                <option value={20}>20 Questions (~60 min)</option>
                            </select>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="glass-card p-6 bg-primary-500/5 border-primary-500/20">
                        <h4 className="font-medium text-white mb-4">Interview Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-dark-400">Type:</span>
                                <span className="text-white ml-2 capitalize">{config.interviewType}</span>
                            </div>
                            <div>
                                <span className="text-dark-400">Style:</span>
                                <span className="text-white ml-2 capitalize">{config.personality}</span>
                            </div>
                            <div>
                                <span className="text-dark-400">Difficulty:</span>
                                <span className="text-white ml-2 capitalize">{config.difficulty}</span>
                            </div>
                            <div>
                                <span className="text-dark-400">Voice:</span>
                                <span className="text-white ml-2">{config.voiceEnabled ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div>
                                <span className="text-dark-400">Questions:</span>
                                <span className="text-white ml-2">{config.totalQuestions}</span>
                            </div>
                            {config.targetCompany && (
                                <div>
                                    <span className="text-dark-400">Company:</span>
                                    <span className="text-white ml-2">{config.targetCompany}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
                {step > 1 ? (
                    <button onClick={handleBack} className="btn-ghost">
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                ) : (
                    <div />
                )}

                <button
                    onClick={handleNext}
                    disabled={startMutation.isPending}
                    className="btn-primary"
                >
                    {startMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : step < 3 ? (
                        <>
                            Next
                            <ArrowRight className="w-5 h-5" />
                        </>
                    ) : (
                        <>
                            Start Interview
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
