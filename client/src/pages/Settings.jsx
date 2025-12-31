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
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-dark-400">Manage your account and preferences</p>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-400" />
                    Profile
                </h2>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="label">First Name</label>
                        <input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className="input" />
                    </div>
                    <div>
                        <label className="label">Last Name</label>
                        <input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className="input" />
                    </div>
                    <div>
                        <label className="label">Experience (years)</label>
                        <input type="number" value={profile['profile.experience']} onChange={(e) => setProfile({ ...profile, 'profile.experience': parseInt(e.target.value) })} className="input" />
                    </div>
                    <div>
                        <label className="label">Target Role</label>
                        <input value={profile['profile.targetRole']} onChange={(e) => setProfile({ ...profile, 'profile.targetRole': e.target.value })} className="input" placeholder="e.g., Senior Engineer" />
                    </div>
                </div>
                <button onClick={handleProfileSave} disabled={isLoading} className="btn-primary">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile'}
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-primary-400" />
                    Interview Preferences
                </h2>
                <div className="space-y-6">
                    <div>
                        <label className="label">Default Interviewer Style</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['strict', 'friendly', 'professional'].map((style) => (
                                <button key={style} onClick={() => setPreferences({ ...preferences, interviewerPersonality: style })} className={`p-3 rounded-xl capitalize ${preferences.interviewerPersonality === style ? 'bg-primary-500/20 border border-primary-500/50 text-primary-400' : 'bg-dark-800 text-dark-300'}`}>
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="label">Default Difficulty</label>
                        <div className="grid grid-cols-4 gap-3">
                            {['easy', 'medium', 'hard', 'expert'].map((level) => (
                                <button key={level} onClick={() => setPreferences({ ...preferences, difficultyLevel: level })} className={`p-3 rounded-xl capitalize ${preferences.difficultyLevel === level ? 'bg-primary-500/20 border border-primary-500/50 text-primary-400' : 'bg-dark-800 text-dark-300'}`}>
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Mic className="w-5 h-5 text-dark-400" />
                            <div>
                                <p className="text-white font-medium">Voice Interviews</p>
                                <p className="text-dark-400 text-sm">Enable microphone for voice responses</p>
                            </div>
                        </div>
                        <button onClick={() => setPreferences({ ...preferences, voiceEnabled: !preferences.voiceEnabled })} className={`w-14 h-8 rounded-full ${preferences.voiceEnabled ? 'bg-primary-500' : 'bg-dark-600'}`}>
                            <div className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${preferences.voiceEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
                <button onClick={handlePreferencesSave} disabled={isLoading} className="btn-primary mt-6">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Preferences'}
                </button>
            </motion.div>
        </div>
    );
}
