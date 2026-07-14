import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../api/fetchHelper';
import { useAuthStore } from '../store/useAuthStore';
import { PageHeader } from '../components/ui/PageHeader';
import { Save, User, Settings as SettingsIcon } from 'lucide-react';
import { NotificationsSettings } from './NotificationsSettings';

export const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'system'>('profile');
  
  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', height: '', weight: '', bodyFatPercent: '',
    targetWeight: '', targetBodyFat: '', medicalNotes: '',
    fitnessGoal: 'maintain', activityLevel: 'sedentary', experienceLevel: 'beginner',
    dailyCalorieGoal: '', dailyProteinGoal: '', dailyWaterGoalLiters: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/users/profile');
      const data = await res.json();
      return data.user;
    }
  });

  useEffect(() => {
    if (profileQuery.data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        ...Object.keys(prev).reduce((acc: any, key) => {
          acc[key] = profileQuery.data[key] || prev[key as keyof typeof prev];
          return acc;
        }, {})
      }));
    }
  }, [profileQuery.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveMessage('');
    try {
      const res = await fetchWithAuth('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.user?.name) {
        updateUser({ name: data.user.name });
      }
      
      if (formData.weight) {
        await fetchWithAuth('/api/weight', {
          method: 'POST',
          body: JSON.stringify({ weight: Number(formData.weight) })
        });
        queryClient.invalidateQueries({ queryKey: ['weightHistory'] });
      }

      setSaveMessage('PROFILE SYNCHRONIZED');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err: any) {
      setSaveMessage(`ERROR: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileQuery.isLoading) {
    return (
      <div className="fixed inset-0 bg-[#00050b] flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <h2 className="font-mono text-sm text-cyan-500 uppercase tracking-[0.3em] animate-pulse">Loading Settings...</h2>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 pb-24 md:pb-8 font-sans z-10 animate-[fade-in_0.5s_ease-out] max-w-7xl mx-auto p-4 md:p-8">
      <PageHeader 
        title="System Settings" 
        subtitle="Configure your profile and system preferences." 
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-cyan-900/50">
        {[
          { id: 'profile', label: 'Hunter Profile', icon: User },
          { id: 'system', label: 'System Configuration', icon: SettingsIcon }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-3 rounded-t-lg text-[11px] font-mono font-bold tracking-[0.2em] uppercase whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-cyan-950/60 text-cyan-400 border-t border-l border-r border-cyan-500 shadow-[0_-5px_15px_rgba(8,145,178,0.2)]' 
                : 'text-gray-500 hover:text-cyan-300 hover:bg-white/5 border-t border-l border-r border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="hud-glass corner-brackets p-6 md:p-8 relative"
          >
            <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-8 flex items-center gap-2">
              <User className="w-5 h-5" /> Profile Parameters
            </h2>

            <form onSubmit={handleSave} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* BIO PARAMS */}
                <div className="space-y-6">
                  <h3 className="font-mono text-[10px] text-cyan-700 uppercase tracking-[0.3em] border-b border-cyan-900/50 pb-2">Biometrics</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Designation</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-base md:text-sm focus:border-cyan-400 focus:outline-none transition-colors" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-base md:text-sm focus:border-cyan-400 focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-base md:text-sm focus:border-cyan-400 focus:outline-none transition-colors appearance-none">
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">HGT (cm)</label>
                        <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-2 sm:px-4 py-3 text-white font-mono text-base md:text-sm focus:border-cyan-400 focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">WGT (kg)</label>
                        <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-2 sm:px-4 py-3 text-white font-mono text-base md:text-sm focus:border-cyan-400 focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">FAT (%)</label>
                        <input type="number" name="bodyFatPercent" value={formData.bodyFatPercent} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-2 sm:px-4 py-3 text-white font-mono text-base md:text-sm focus:border-cyan-400 focus:outline-none transition-colors" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Target WGT (kg)</label>
                        <input type="number" name="targetWeight" value={formData.targetWeight} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-base md:text-sm focus:border-cyan-400 focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Target FAT (%)</label>
                        <input type="number" name="targetBodyFat" value={formData.targetBodyFat} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-base md:text-sm focus:border-cyan-400 focus:outline-none transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Medical Notes (Optional)</label>
                      <input type="text" name="medicalNotes" value={formData.medicalNotes} onChange={handleChange} placeholder="e.g. Asthma, Knee Injury" className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-base md:text-sm focus:border-cyan-400 focus:outline-none transition-colors" />
                    </div>
                  </div>
                </div>

                {/* COMBAT PARAMS */}
                <div className="space-y-6">
                  <h3 className="font-mono text-[10px] text-cyan-700 uppercase tracking-[0.3em] border-b border-cyan-900/50 pb-2">Combat Directives</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Primary Objective</label>
                      <select name="fitnessGoal" value={formData.fitnessGoal} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-base md:text-sm focus:border-cyan-400 focus:outline-none transition-colors appearance-none">
                        <option value="lose_weight">Lose Weight</option>
                        <option value="maintain">Maintain Weight</option>
                        <option value="gain_muscle">Gain Muscle</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Activity Level</label>
                      <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-base md:text-sm focus:border-cyan-400 focus:outline-none transition-colors appearance-none">
                        <option value="sedentary">Sedentary (Office job, little exercise)</option>
                        <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                        <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                        <option value="very_active">Very Active (6-7 days/week)</option>
                        <option value="extra_active">Extra Active (Physical job + training)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Rank Assessment</label>
                      <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-base md:text-sm focus:border-cyan-400 focus:outline-none transition-colors appearance-none">
                        <option value="beginner">Beginner (E-Rank)</option>
                        <option value="intermediate">Intermediate (C-Rank)</option>
                        <option value="advanced">Advanced (A-Rank)</option>
                        <option value="expert">Expert (S-Rank)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-8 border-t border-cyan-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                {saveMessage && (
                  <div className={`font-mono text-[10px] tracking-widest uppercase ${saveMessage.includes('ERROR') ? 'text-red-500' : 'text-green-400 shadow-[0_0_10px_#4ade80] px-3 py-1 border border-green-900 bg-green-950/30 rounded'}`}>
                    {saveMessage}
                  </div>
                )}
                <div className="flex-1" />
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-cyan-950/80 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.2)] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {isSubmitting ? 'SYNCHRONIZING...' : 'SAVE CONFIGURATION'}
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {activeTab === 'system' && (
          <motion.div 
            key="system"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          >
            <NotificationsSettings />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
