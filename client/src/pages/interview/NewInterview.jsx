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
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-5 sm:mb-8 lg:mb-12">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div
                            className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-medium text-[10px] sm:text-sm lg:text-base transition-all ${s === step
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
                                className={`w-8 sm:w-16 lg:w-24 h-0.5 lg:h-1 mx-1 lg:mx-2 rounded ${s < step ? 'bg-success-500' : 'bg-dark-700'
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
                    <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-white text-center mb-1 lg:mb-2">
                        Choose Interview Type
                    </h1>
                    <p className="text-dark-400 text-center text-xs sm:text-sm lg:text-base mb-4 sm:mb-6 lg:mb-8">
                        Select the type of interview you want to practice
                    </p>

                    {/* Interview type cards */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
                        {interviewTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setConfig({ ...config, interviewType: type.id })}
                                className={`p-2.5 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl text-left transition-all ${config.interviewType === type.id
                                    ? 'bg-dark-800/80 border border-primary-500/50 shadow-lg shadow-primary-500/10'
                                    : 'bg-dark-900/60 border border-dark-800/50 hover:border-dark-600'
                                    }`}
                            >
                                <div className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-2 sm:mb-3 lg:mb-4`}>
                                    <type.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
                                </div>
                                <h3 className="text-xs sm:text-sm lg:text-lg font-semibold text-white mb-0.5 lg:mb-1">{type.name}</h3>
                                <p className="text-dark-500 text-[9px] sm:text-xs lg:text-sm leading-tight line-clamp-2">{type.description}</p>
                            </button>
                        ))}
                    </div>

                    {/* Sub Categories */}
                    {selectedType && (
                        <div className="bg-dark-900/60 border border-dark-800/50 rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
                            <h4 className="text-[10px] sm:text-xs lg:text-sm font-medium text-dark-500 mb-2 lg:mb-3">Focus Area (Optional)</h4>
                            <div className="flex flex-wrap gap-1.5 lg:gap-2">
                                {selectedType.subCategories.map((sub) => (
                                    <button
                                        key={sub}
                                        onClick={() => setConfig({ ...config, subCategory: config.subCategory === sub ? '' : sub })}
                                        className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-md lg:rounded-lg text-[10px] sm:text-xs lg:text-sm transition-all ${config.subCategory === sub
                                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                                            : 'bg-dark-800/50 text-dark-400 hover:bg-dark-700'
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
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center mb-1">
                        Configure Your Interview
                    </h1>
                    <p className="text-dark-400 text-center text-xs sm:text-sm mb-4 sm:mb-6">
                        Customize the interview experience
                    </p>

                    {/* Interviewer Personality */}
                    <div className="mb-4 sm:mb-6">
                        <h4 className="text-xs sm:text-sm font-medium text-dark-400 mb-2 sm:mb-3">Interviewer Style</h4>
                        <div className="space-y-1.5 sm:space-y-2">
                            {personalities.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setConfig({ ...config, personality: p.id })}
                                    className={`w-full p-2.5 sm:p-3 rounded-lg text-left transition-all flex items-center gap-2.5 sm:gap-3 ${config.personality === p.id
                                        ? 'bg-dark-800/80 border border-primary-500/50'
                                        : 'bg-dark-900/60 border border-dark-800/50 hover:border-dark-600'
                                        }`}
                                >
                                    <p.icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${config.personality === p.id ? 'text-primary-400' : 'text-dark-500'}`} />
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-medium text-white text-xs sm:text-sm">{p.name}</h5>
                                        <p className="text-dark-500 text-[10px] sm:text-xs truncate">{p.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="mb-4 sm:mb-6">
                        <h4 className="text-xs sm:text-sm font-medium text-dark-400 mb-2 sm:mb-3">Starting Difficulty</h4>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                            {difficulties.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => setConfig({ ...config, difficulty: d.id })}
                                    className={`p-2 sm:p-3 rounded-lg text-center transition-all ${config.difficulty === d.id
                                        ? 'bg-dark-800/80 border border-primary-500/50'
                                        : 'bg-dark-900/60 border border-dark-800/50 hover:border-dark-600'
                                        }`}
                                >
                                    <p className="font-medium text-white text-[10px] sm:text-xs">{d.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Voice Toggle */}
                    <div className="bg-dark-900/60 border border-dark-800/50 rounded-lg p-2.5 sm:p-3 mb-4 sm:mb-6">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                {config.voiceEnabled ? (
                                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 flex-shrink-0" />
                                ) : (
                                    <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-dark-500 flex-shrink-0" />
                                )}
                                <div className="min-w-0">
                                    <h5 className="font-medium text-white text-xs sm:text-sm">Voice Interview</h5>
                                    <p className="text-dark-500 text-[10px] sm:text-xs truncate">Use microphone to answer</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setConfig({ ...config, voiceEnabled: !config.voiceEnabled })}
                                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full flex-shrink-0 transition-all ${config.voiceEnabled ? 'bg-primary-500' : 'bg-dark-600'
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white shadow transition-transform ${config.voiceEnabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5'
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
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center mb-1">
                        Target Position (Optional)
                    </h1>
                    <p className="text-dark-400 text-center text-xs sm:text-sm mb-4 sm:mb-6">
                        Customize questions for your dream role
                    </p>

                    <div className="bg-dark-900/60 border border-dark-800/50 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                        <div>
                            <label className="text-[10px] sm:text-xs font-medium text-dark-500 mb-1.5 flex items-center gap-1.5">
                                <Building2 className="w-3 h-3" />
                                Target Company
                            </label>
                            <input
                                type="text"
                                value={config.targetCompany}
                                onChange={(e) => setConfig({ ...config, targetCompany: e.target.value })}
                                className="w-full bg-dark-800/50 border border-dark-700/50 rounded-md px-2.5 py-2 text-xs sm:text-sm text-white placeholder-dark-500"
                                placeholder="e.g., Google, Amazon"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] sm:text-xs font-medium text-dark-500 mb-1.5 flex items-center gap-1.5">
                                <Target className="w-3 h-3" />
                                Target Role
                            </label>
                            <input
                                type="text"
                                value={config.targetRole}
                                onChange={(e) => setConfig({ ...config, targetRole: e.target.value })}
                                className="w-full bg-dark-800/50 border border-dark-700/50 rounded-md px-2.5 py-2 text-xs sm:text-sm text-white placeholder-dark-500"
                                placeholder="e.g., Senior Engineer"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] sm:text-xs font-medium text-dark-500 mb-1.5 flex items-center gap-1.5">
                                <HelpCircle className="w-3 h-3" />
                                Questions
                            </label>
                            <select
                                value={config.totalQuestions}
                                onChange={(e) => setConfig({ ...config, totalQuestions: parseInt(e.target.value) })}
                                className="w-full bg-dark-800/50 border border-dark-700/50 rounded-md px-2.5 py-2 text-xs sm:text-sm text-white"
                            >
                                <option value={5}>5 (~15 min)</option>
                                <option value={10}>10 (~30 min)</option>
                                <option value={15}>15 (~45 min)</option>
                                <option value={20}>20 (~60 min)</option>
                            </select>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-3 sm:p-4">
                        <h4 className="font-medium text-white text-xs sm:text-sm mb-2 sm:mb-3">Interview Summary</h4>
                        <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                            <div>
                                <span className="text-dark-500">Type:</span>
                                <span className="text-white ml-1 capitalize">{config.interviewType}</span>
                            </div>
                            <div>
                                <span className="text-dark-500">Style:</span>
                                <span className="text-white ml-1 capitalize">{config.personality}</span>
                            </div>
                            <div>
                                <span className="text-dark-500">Difficulty:</span>
                                <span className="text-white ml-1 capitalize">{config.difficulty}</span>
                            </div>
                            <div>
                                <span className="text-dark-500">Voice:</span>
                                <span className="text-white ml-1">{config.voiceEnabled ? 'On' : 'Off'}</span>
                            </div>
                            <div>
                                <span className="text-dark-500">Questions:</span>
                                <span className="text-white ml-1">{config.totalQuestions}</span>
                            </div>
                            {config.targetCompany && (
                                <div>
                                    <span className="text-dark-500">Company:</span>
                                    <span className="text-white ml-1">{config.targetCompany}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-5 sm:mt-6">
                {step > 1 ? (
                    <button onClick={handleBack} className="text-dark-400 hover:text-white text-xs sm:text-sm font-medium px-3 py-2 flex items-center gap-1 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back
                    </button>
                ) : (
                    <div />
                )}

                <button
                    onClick={handleNext}
                    disabled={startMutation.isPending}
                    className="bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-medium px-4 sm:px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50"
                >
                    {startMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : step < 3 ? (
                        <>
                            Next
                            <ArrowRight className="w-3.5 h-3.5" />
                        </>
                    ) : (
                        <>
                            Start
                            <ArrowRight className="w-3.5 h-3.5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
