import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { User, Settings as SettingsIcon, Mic, Bell, Shield, Loader2 } from 'lucide-react';

export default function Settings() {
    const { user, updatePreferences, updateProfile } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        'profile.experience': user?.profile?.experience || 0,
        'profile.targetRole': user?.profile?.targetRole || '',
        'profile.targetCompany': user?.profile?.targetCompany || ''
    });
    const [preferences, setPreferences] = useState({
        interviewerPersonality: user?.preferences?.interviewerPersonality || 'professional',
        difficultyLevel: user?.preferences?.difficultyLevel || 'medium',
        voiceEnabled: user?.preferences?.voiceEnabled ?? true
    });

    const handleProfileSave = async () => {
        setIsLoading(true);
        try {
            await updateProfile(profile);
            toast.success('Profile updated');
        } catch (e) {
            toast.error('Failed to update');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreferencesSave = async () => {
        setIsLoading(true);
        try {
            await updatePreferences(preferences);
            toast.success('Preferences updated');
        } catch (e) {
            toast.error('Failed to update');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="text-center sm:text-left">
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-white mb-0.5 lg:mb-2">Settings</h1>
                <p className="text-dark-400 text-xs sm:text-sm lg:text-base">Manage your account and preferences</p>
            </div>

            {/* Profile Section */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-900/60 border border-dark-800/50 rounded-lg lg:rounded-2xl p-3 sm:p-4 lg:p-6"
            >
                <h2 className="text-xs sm:text-sm lg:text-lg font-semibold text-white mb-3 sm:mb-4 lg:mb-6 flex items-center gap-1.5 lg:gap-2">
                    <User className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-primary-400" />
                    Profile
                </h2>

                {/* 2-column grid */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
                    <div>
                        <label className="text-[10px] sm:text-xs lg:text-sm font-medium text-dark-500 mb-1 lg:mb-2 block">First Name</label>
                        <input
                            value={profile.firstName}
                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                            className="w-full bg-dark-800/50 border border-dark-700/50 rounded-md lg:rounded-lg px-2.5 lg:px-4 py-2 lg:py-3 text-xs sm:text-sm lg:text-base text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] sm:text-xs lg:text-sm font-medium text-dark-500 mb-1 lg:mb-2 block">Last Name</label>
                        <input
                            value={profile.lastName}
                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                            className="w-full bg-dark-800/50 border border-dark-700/50 rounded-md lg:rounded-lg px-2.5 lg:px-4 py-2 lg:py-3 text-xs sm:text-sm lg:text-base text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] sm:text-xs lg:text-sm font-medium text-dark-500 mb-1 lg:mb-2 block">Experience (yrs)</label>
                        <input
                            type="number"
                            value={profile['profile.experience']}
                            onChange={(e) => setProfile({ ...profile, 'profile.experience': parseInt(e.target.value) })}
                            className="w-full bg-dark-800/50 border border-dark-700/50 rounded-md lg:rounded-lg px-2.5 lg:px-4 py-2 lg:py-3 text-xs sm:text-sm lg:text-base text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] sm:text-xs lg:text-sm font-medium text-dark-500 mb-1 lg:mb-2 block">Target Role</label>
                        <input
                            value={profile['profile.targetRole']}
                            onChange={(e) => setProfile({ ...profile, 'profile.targetRole': e.target.value })}
                            className="w-full bg-dark-800/50 border border-dark-700/50 rounded-md lg:rounded-lg px-2.5 lg:px-4 py-2 lg:py-3 text-xs sm:text-sm lg:text-base text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50"
                            placeholder="e.g., Senior Engineer"
                        />
                    </div>
                </div>

                <button
                    onClick={handleProfileSave}
                    disabled={isLoading}
                    className="w-full lg:w-auto bg-primary-500 hover:bg-primary-600 text-white text-xs lg:text-sm font-medium px-4 lg:px-6 py-2 lg:py-3 rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 lg:w-5 lg:h-5 animate-spin" /> : 'Save Profile'}
                </button>
            </motion.div>

            {/* Interview Preferences Section */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-dark-900/60 border border-dark-800/50 rounded-lg lg:rounded-2xl p-3 sm:p-4 lg:p-6"
            >
                <h2 className="text-xs sm:text-sm lg:text-lg font-semibold text-white mb-3 sm:mb-4 lg:mb-6 flex items-center gap-1.5 lg:gap-2">
                    <SettingsIcon className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-primary-400" />
                    Interview Preferences
                </h2>

                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {/* Interviewer Style - 3 cols */}
                    <div>
                        <label className="text-[10px] sm:text-xs lg:text-sm font-medium text-dark-500 mb-1.5 lg:mb-2 block">Interviewer Style</label>
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:gap-3">
                            {['strict', 'friendly', 'professional'].map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setPreferences({ ...preferences, interviewerPersonality: style })}
                                    className={`p-2 lg:p-4 rounded-lg lg:rounded-xl capitalize text-[10px] sm:text-xs lg:text-sm transition-all ${preferences.interviewerPersonality === style
                                        ? 'bg-primary-500/15 border border-primary-500/50 text-primary-400'
                                        : 'bg-dark-800/50 border border-dark-700/50 text-dark-400 hover:border-dark-600'}`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty Level - 4 cols */}
                    <div>
                        <label className="text-[10px] sm:text-xs lg:text-sm font-medium text-dark-500 mb-1.5 lg:mb-2 block">Default Difficulty</label>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3">
                            {['easy', 'medium', 'hard', 'expert'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setPreferences({ ...preferences, difficultyLevel: level })}
                                    className={`p-2 lg:p-4 rounded-lg lg:rounded-xl capitalize text-[10px] sm:text-xs lg:text-sm transition-all ${preferences.difficultyLevel === level
                                        ? 'bg-primary-500/15 border border-primary-500/50 text-primary-400'
                                        : 'bg-dark-800/50 border border-dark-700/50 text-dark-400 hover:border-dark-600'}`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Voice Toggle */}
                    <div className="flex items-center justify-between gap-3 lg:gap-4 p-2.5 lg:p-4 bg-dark-800/30 rounded-lg lg:rounded-xl">
                        <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                            <Mic className="w-4 h-4 lg:w-6 lg:h-6 text-dark-500 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-white font-medium text-xs lg:text-base">Voice Interviews</p>
                                <p className="text-dark-500 text-[10px] lg:text-sm truncate">Enable microphone for voice responses</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPreferences({ ...preferences, voiceEnabled: !preferences.voiceEnabled })}
                            className={`w-10 h-5 sm:w-12 sm:h-6 lg:w-14 lg:h-8 rounded-full flex-shrink-0 transition-colors ${preferences.voiceEnabled ? 'bg-primary-500' : 'bg-dark-600'}`}
                        >
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full bg-white shadow transition-transform ${preferences.voiceEnabled ? 'translate-x-5 sm:translate-x-6 lg:translate-x-7' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>

                <button
                    onClick={handlePreferencesSave}
                    disabled={isLoading}
                    className="w-full lg:w-auto mt-3 sm:mt-4 lg:mt-6 bg-primary-500 hover:bg-primary-600 text-white text-xs lg:text-sm font-medium px-4 lg:px-6 py-2 lg:py-3 rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 lg:w-5 lg:h-5 animate-spin" /> : 'Save Preferences'}
                </button>
            </motion.div>
        </div>
    );
}

