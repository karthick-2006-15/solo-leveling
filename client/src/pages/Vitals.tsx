import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Moon, Heart, Brain, TrendingUp, Sparkles, 
  Lock, Plus, Edit3, Info
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { healthApi } from '../api/healthApi';
import { formatSafeDate } from '../utils/dateUtils';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchWithAuth } from '../api/fetchHelper';
import { toast } from 'react-hot-toast';

export const Vitals: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'recovery' | 'sleep' | 'wellness' | 'body'>('recovery');

  // Editing state for logged days
  const [isEditingSleep, setIsEditingSleep] = useState(false);
  const [isEditingWellness, setIsEditingWellness] = useState(false);
  const [isLoggingBiometrics, setIsLoggingBiometrics] = useState(false);

  // Form states
  const [sleepForm, setSleepForm] = useState({ durationMinutes: 480, quality: 80 });
  const [wellnessForm, setWellnessForm] = useState({ mood: 8, stress: 3, focus: 7 });
  const [biometricsForm, setBiometricsForm] = useState({ weight: 70, bodyFatPercent: 15 });

  // Countdown until midnight helper
  const getMidnightCountdown = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diffMs = midnight.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m remaining`;
  };

  const [countdown, setCountdown] = useState(getMidnightCountdown());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getMidnightCountdown());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // 1. Fetch 30-day analytics history
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['healthAnalytics'],
    queryFn: async () => {
      const res = await healthApi.getAnalytics(30);
      return (await res.json()).data;
    }
  });

  // 2. Fetch today's logging status from the new endpoint
  const { data: todayStatus, isLoading: isLoadingToday } = useQuery({
    queryKey: ['todayStatus'],
    queryFn: async () => {
      const res = await healthApi.getTodayStatus();
      return (await res.json()).data;
    }
  });

  // 3. Fetch user profile for Height calculation
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/users/profile');
      return (await res.json()).user;
    }
  });

  const startEditingSleep = () => {
    setSleepForm({
      durationMinutes: todayStatus?.sleepLog?.durationMinutes || 480,
      quality: todayStatus?.sleepLog?.quality || 80
    });
    setIsEditingSleep(true);
  };

  const startEditingWellness = () => {
    setWellnessForm({
      mood: todayStatus?.wellnessLog?.mood || 8,
      stress: todayStatus?.wellnessLog?.stress || 3,
      focus: todayStatus?.wellnessLog?.focus || 7
    });
    setIsEditingWellness(true);
  };

  // Mutations
  const sleepMutation = useMutation({
    mutationFn: healthApi.logSleep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['todayStatus'] });
      setIsEditingSleep(false);
      toast.success('Sleep parameters synchronized.');
    },
    onError: () => toast.error('Failed to update sleep.')
  });

  const wellnessMutation = useMutation({
    mutationFn: healthApi.logWellness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['todayStatus'] });
      setIsEditingWellness(false);
      toast.success('Cognitive wellness synchronized.');
    },
    onError: () => toast.error('Failed to update assessment.')
  });

  const biometricsMutation = useMutation({
    mutationFn: healthApi.logBodyMetrics,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsLoggingBiometrics(false);
      toast.success('Biometric blueprint uploaded.');
    },
    onError: () => toast.error('Failed to upload biometrics.')
  });

  if (isLoadingAnalytics || isLoadingToday) {
    return (
      <div className="fixed inset-0 bg-[#00050b] flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <h2 className="font-mono text-sm text-cyan-500 uppercase tracking-[0.3em] animate-pulse">Scanning Bio-Grid...</h2>
      </div>
    );
  }

  // Parse historical data
  const recoveryData = analytics?.recoveryTrend?.slice(-7).map((r: any) => ({
    date: formatSafeDate(r.date, 'MMM dd'),
    score: r.recoveryScore,
    energy: r.energyScore
  })) || [];

  const weightTrendData = analytics?.weightTrend?.map((w: any) => ({
    date: formatSafeDate(w.loggedAt, 'MMM dd'),
    weight: w.weight,
    fat: w.bodyFatPercent || 15
  })) || [];

  // Parse today metrics
  const sleepLog = todayStatus?.sleepLog;
  const wellnessLog = todayStatus?.wellnessLog;
  const recoveryLog = todayStatus?.recoveryLog;

  const currentRecoveryScore = recoveryLog?.recoveryScore ?? 50;

  // Biometrics Calculations
  const height = profile?.height || 175; // default 175 cm if not set
  const latestWeightLog = analytics?.weightTrend?.[analytics.weightTrend.length - 1];
  const currentWeight = latestWeightLog?.weight || profile?.weight || 70;
  const currentBodyFat = latestWeightLog?.bodyFatPercent || profile?.bodyFatPercent || 15;

  const bmi = Number((currentWeight / ((height / 100) * (height / 100))).toFixed(1));
  const leanBodyMass = Number((currentWeight * (1 - currentBodyFat / 100)).toFixed(1));
  const muscleMass = Number((leanBodyMass * 0.8).toFixed(1)); // estimate muscle as 80% of lean mass

  // Hunter Physical Power Score
  const physicalPowerScore = Math.round((leanBodyMass * 2.2) + (height * 0.1));
  const getPowerRank = (score: number) => {
    if (score >= 170) return 'S-RANK';
    if (score >= 150) return 'A-RANK';
    if (score >= 130) return 'B-RANK';
    if (score >= 110) return 'C-RANK';
    return 'D-RANK';
  };

  // AI recovery recommendations
  const getAIRecommendation = (score: number) => {
    if (score < 50) {
      return "CRITICAL STATUS: Severe fatigue detected. The System strongly suggests zero physical strain. Prioritize deep hydration, complete sleep hygiene, and active recovery protocols immediately.";
    }
    if (score < 80) {
      return "STABILIZED STATUS: Moderate physical reserves. Standard daily missions cleared. Avoid setting new performance bounds. Target consistent nutrition metrics and baseline cardiovascular targets.";
    }
    return "PEAK CONDITION: Absolute synchronization achieved. The Monarch's vessel is cleared for maximum force output. High-difficulty dungeons and campaign achievements are highly recommended.";
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-24 font-sans animate-[fade-in_0.5s_ease-out] overflow-x-hidden">
      <PageHeader 
        title="Hunter Vitals" 
        subtitle="Medical & Recovery Intelligence" 
      />

      {/* TABS NAVIGATION */}
      <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-cyan-900/50 -mx-3 px-3 md:mx-0 md:px-0">
        {[
          { id: 'recovery', label: 'Recovery Matrix', icon: Heart, status: recoveryLog ? '🟢' : '🟡' },
          { id: 'sleep', label: 'Sleep Logs', icon: Moon, status: sleepLog ? '🟢' : '🟡' },
          { id: 'wellness', label: 'Mental State', icon: Brain, status: wellnessLog ? '🟢' : '🟡' },
          { id: 'body', label: 'Biometrics Blueprint', icon: TrendingUp, status: latestWeightLog ? '🟢' : '🟡' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 md:px-6 py-3 min-h-[44px] rounded-t-lg text-[11px] font-mono font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase whitespace-nowrap transition-all flex items-center gap-1.5 md:gap-2 ${
              activeTab === tab.id 
                ? 'bg-cyan-950/60 text-cyan-400 border-t border-l border-r border-cyan-500 shadow-[0_-5px_15px_rgba(8,145,178,0.2)]' 
                : 'text-gray-500 hover:text-cyan-300 hover:bg-white/5 border-t border-l border-r border-transparent'
            }`}
          >
            <span>{tab.status}</span>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* ================= RECOVERY TAB ================= */}
        {activeTab === 'recovery' && (
          <>
            {/* Left/Middle Column: Recovery Trend & Data */}
            <div className="lg:col-span-2 space-y-6">
              <div className="hud-glass corner-brackets p-4 md:p-6 h-[300px] md:h-[350px] relative flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 text-sm md:text-base">7-Day Recovery Trajectory</h2>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">Synchronized logs</span>
                  </div>
                </div>
                
                <div className="flex-1 w-full min-h-[180px]">
                  {recoveryData.length > 0 ? (
                    <ResponsiveContainer width="99%" height="100%">
                      <AreaChart data={recoveryData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorRecScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="rgba(0,212,255,0.3)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                        <YAxis domain={[0, 100]} stroke="rgba(0,212,255,0.3)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,5,11,0.9)', border: '1px solid #00d4ff', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '11px' }} />
                        <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2.5} fill="url(#colorRecScore)" name="Recovery Score" />
                        <Area type="monotone" dataKey="energy" stroke="#eab308" strokeWidth={1.5} fill="none" name="Energy Level" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <Lock className="w-8 h-8 text-cyan-900/50 mb-3" />
                      <div className="text-[11px] font-mono text-cyan-900 uppercase tracking-widest">No Recovery Metrics Available</div>
                      <div className="text-[9px] text-gray-600 font-mono mt-1">Log sleep and biometrics to initialize tracking.</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recovery Logs History */}
              <div className="hud-glass corner-brackets p-4 md:p-6">
                <h3 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-4 text-sm">Recovery Registry</h3>
                <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                  {analytics?.recoveryTrend?.length > 0 ? (
                    analytics.recoveryTrend.slice().reverse().map((r: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-black/40 border border-cyan-900/30 p-3 rounded-lg font-mono text-xs">
                        <span className="text-gray-400">{formatSafeDate(r.date, 'yyyy-MM-dd')}</span>
                        <div className="flex gap-4">
                          <span className="text-gray-500">Readiness: <span className="text-cyan-400 font-bold">{r.readinessScore}%</span></span>
                          <span className="text-gray-500">Recovery: <span className="text-green-400 font-bold">{r.recoveryScore}%</span></span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 font-mono text-[10px] text-gray-600 uppercase tracking-widest">No history logs recorded</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Score metrics & Contributions */}
            <div className="space-y-6">
              {/* Primary Score Ring */}
              <div className="hud-glass corner-brackets p-6 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Calculated Readiness</span>
                <div className="relative w-32 h-32 flex items-center justify-center my-3">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="6" />
                    <circle 
                      cx="50" cy="50" r="42" fill="none" stroke="#22c55e" strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - currentRecoveryScore / 100)}`}
                      className="transition-all duration-1000 ease-out shadow-[0_0_15px_#22c55e]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-4xl font-bold text-white tracking-wider">{currentRecoveryScore}</span>
                    <span className="text-[8px] font-mono text-gray-500 uppercase">SYS INDEX</span>
                  </div>
                </div>
                <div className="font-mono text-xs uppercase tracking-widest text-green-400 px-3 py-1 bg-green-950/20 border border-green-900/50 rounded-full">
                  Status: {recoveryLog ? '🟢 LOGGED TODAY' : '🟡 AVAILABLE'}
                </div>
              </div>

              {/* Contributions */}
              <div className="hud-glass corner-brackets p-4 md:p-6 space-y-4">
                <h3 className="font-mono text-[10px] text-cyan-400 uppercase tracking-[0.3em] border-b border-cyan-900/50 pb-2">Contribution Analysis</h3>
                <div className="space-y-3">
                  <ContributionProgress label="Sleep Score" val={recoveryLog?.components?.sleepScore ?? 50} color="bg-indigo-500" />
                  <ContributionProgress label="Workout Intensity" val={recoveryLog?.components?.workoutIntensity ?? 0} color="bg-red-500" max={120} />
                  <ContributionProgress label="Hydration Tracker" val={Math.min(100, Math.round(((todayStatus?.hydrationMl ?? 0) / 3000) * 100))} color="bg-cyan-500" />
                  <ContributionProgress label="Nutrition Tracker" val={Math.min(100, Math.round(((todayStatus?.caloriesKcal ?? 0) / 2000) * 100))} color="bg-yellow-500" />
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="hud-glass corner-brackets border-purple-900/50 p-4 md:p-6">
                <h3 className="font-mono text-[10px] text-purple-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" /> AI Recovery Suggestion
                </h3>
                <p className="font-mono text-xs text-purple-100/90 leading-relaxed italic bg-purple-950/20 p-3 border border-purple-900/30 rounded-lg">
                  "{getAIRecommendation(currentRecoveryScore)}"
                </p>
              </div>
            </div>
          </>
        )}

        {/* ================= SLEEP TAB ================= */}
        {activeTab === 'sleep' && (
          <>
            {/* Left/Middle Column: Sleep Status display */}
            <div className="lg:col-span-2 space-y-6">
              <div className="hud-glass corner-brackets p-6 relative">
                {sleepLog && !isEditingSleep ? (
                  <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
                    <div className="flex justify-between items-center border-b border-cyan-900/50 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Directives Registry</span>
                        <h2 className="font-display uppercase tracking-[0.2em] text-cyan-400 text-xl font-bold mt-1">✓ Sleep Logged Today</h2>
                      </div>
                      <span className="px-3 py-1 bg-green-950/30 border border-green-800 text-green-400 text-[10px] font-mono rounded-full uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Logged Today
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 border border-cyan-900/30 p-4 rounded-xl">
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Sleep Duration</span>
                        <div className="text-3xl font-display font-bold text-white mt-1">{(sleepLog.durationMinutes / 60).toFixed(1)} <span className="text-sm font-mono font-normal text-gray-400">HRS</span></div>
                      </div>
                      <div className="bg-black/40 border border-cyan-900/30 p-4 rounded-xl">
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Sleep Quality</span>
                        <div className="text-3xl font-display font-bold text-cyan-400 mt-1">{sleepLog.quality}<span className="text-sm font-mono font-normal text-gray-400">%</span></div>
                      </div>
                    </div>

                    <div className="bg-cyan-950/20 border border-cyan-900/40 p-4 rounded-xl space-y-2 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Time Logged:</span>
                        <span className="text-white">{new Date(sleepLog.createdAt || sleepLog.loggedAt || new Date()).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Synced:</span>
                        <span className="text-white">{new Date(sleepLog.updatedAt || new Date()).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-cyan-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" /> Next log available in: <span className="text-cyan-400 font-bold">{countdown}</span>
                      </div>
                      <button 
                        onClick={startEditingSleep}
                        className="w-full sm:w-auto px-6 py-2.5 bg-cyan-950 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" /> Update Today's Sleep
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-cyan-900/50 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Biometric Log</span>
                        <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 text-xl font-bold mt-1">Configure Sleep Parameters</h2>
                      </div>
                      <span className="px-3 py-1 bg-yellow-950/30 border border-yellow-800 text-yellow-400 text-[10px] font-mono rounded-full uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> {isEditingSleep ? 'Updating Log' : 'Available'}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Duration (Hours)</label>
                        <input 
                          type="number" 
                          step="0.5" 
                          value={sleepForm.durationMinutes / 60} 
                          onChange={e => setSleepForm({ ...sleepForm, durationMinutes: Number(e.target.value) * 60 })} 
                          className="w-full bg-black/50 border border-cyan-900/50 rounded-[2px] px-4 py-3 text-base text-white font-mono focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Quality (0-100)</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={sleepForm.quality} 
                          onChange={e => setSleepForm({ ...sleepForm, quality: Number(e.target.value) })} 
                          className="w-full accent-cyan-500" 
                        />
                        <div className="text-right font-mono text-xs text-cyan-400 mt-1">{sleepForm.quality}%</div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-cyan-900/50">
                        {isEditingSleep && (
                          <button 
                            type="button"
                            onClick={() => setIsEditingSleep(false)}
                            className="flex-1 py-3 border border-gray-700 text-gray-400 hover:text-white rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all min-h-[44px]"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          onClick={() => sleepMutation.mutate(sleepForm)} 
                          disabled={sleepMutation.isPending} 
                          className="flex-[2] py-3 bg-cyan-950/80 border border-cyan-500 text-cyan-400 rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold hover:bg-cyan-500 hover:text-black transition-all min-h-[44px] flex items-center justify-center"
                        >
                          {sleepMutation.isPending ? 'Synchronizing...' : 'Log Sleep'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Mini Info card */}
            <div className="space-y-6">
              <div className="hud-glass corner-brackets p-4 md:p-6 space-y-4">
                <h3 className="font-mono text-[10px] text-cyan-400 uppercase tracking-[0.3em] border-b border-cyan-900/50 pb-2">Sleep Intelligence</h3>
                <p className="font-mono text-xs text-gray-400 leading-relaxed">
                  Adequate recovery (7-9 hours) acts as a multipliers for overall stat accumulation. Insufficient sleep parameters introduces a training exhaustion penalty to next-day missions.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ================= MENTAL STATE TAB ================= */}
        {activeTab === 'wellness' && (
          <>
            {/* Left/Middle Column: Wellness Status display */}
            <div className="lg:col-span-2 space-y-6">
              <div className="hud-glass corner-brackets border-[var(--color-system-purple)] shadow-purple p-6 relative">
                {wellnessLog && !isEditingWellness ? (
                  <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
                    <div className="flex justify-between items-center border-b border-purple-900/50 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Cognitive Core</span>
                        <h2 className="font-display uppercase tracking-[0.2em] text-purple-400 text-xl font-bold mt-1">✓ Assessment Completed</h2>
                      </div>
                      <span className="px-3 py-1 bg-green-950/30 border border-green-800 text-green-400 text-[10px] font-mono rounded-full uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Analyzed
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-black/40 border border-purple-950/30 p-3 rounded-xl text-center">
                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Mood</span>
                        <div className="text-2xl font-display font-bold text-white mt-1">{wellnessLog.mood} <span className="text-xs text-gray-500">/10</span></div>
                      </div>
                      <div className="bg-black/40 border border-purple-950/30 p-3 rounded-xl text-center">
                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Stress</span>
                        <div className="text-2xl font-display font-bold text-red-400 mt-1">{wellnessLog.stress} <span className="text-xs text-gray-500">/10</span></div>
                      </div>
                      <div className="bg-black/40 border border-purple-950/30 p-3 rounded-xl text-center">
                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Focus</span>
                        <div className="text-2xl font-display font-bold text-cyan-400 mt-1">{wellnessLog.focus} <span className="text-xs text-gray-500">/10</span></div>
                      </div>
                    </div>

                    <div className="bg-purple-950/20 border border-purple-900/40 p-4 rounded-xl space-y-2 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Synced:</span>
                        <span className="text-white">{new Date(wellnessLog.updatedAt || wellnessLog.loggedAt || new Date()).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-purple-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" /> Next check-in in: <span className="text-purple-400 font-bold">{countdown}</span>
                      </div>
                      <button 
                        onClick={startEditingWellness}
                        className="w-full sm:w-auto px-6 py-2.5 bg-purple-950 border border-purple-400 text-purple-300 hover:bg-purple-500 hover:text-white rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" /> Update Today's Assessment
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-purple-900/50 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Mental Assessment</span>
                        <h2 className="font-display uppercase tracking-[0.2em] text-purple-400 text-xl font-bold mt-1">Calibrate Core Indicators</h2>
                      </div>
                      <span className="px-3 py-1 bg-yellow-950/30 border border-yellow-800 text-yellow-400 text-[10px] font-mono rounded-full uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> {isEditingWellness ? 'Calibrating' : 'Available'}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Mood (1-10)</label>
                        <input type="range" min="1" max="10" value={wellnessForm.mood} onChange={e => setWellnessForm({ ...wellnessForm, mood: Number(e.target.value) })} className="w-full accent-purple-500" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Stress (1-10)</label>
                        <input type="range" min="1" max="10" value={wellnessForm.stress} onChange={e => setWellnessForm({ ...wellnessForm, stress: Number(e.target.value) })} className="w-full accent-red-500" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Focus (1-10)</label>
                        <input type="range" min="1" max="10" value={wellnessForm.focus} onChange={e => setWellnessForm({ ...wellnessForm, focus: Number(e.target.value) })} className="w-full accent-cyan-500" />
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-purple-900/50">
                        {isEditingWellness && (
                          <button 
                            type="button"
                            onClick={() => setIsEditingWellness(false)}
                            className="flex-1 py-3 border border-gray-700 text-gray-400 hover:text-white rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all min-h-[44px]"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          onClick={() => wellnessMutation.mutate(wellnessForm)} 
                          disabled={wellnessMutation.isPending} 
                          className="flex-[2] py-3 bg-purple-950/80 border border-purple-500 text-purple-400 rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold hover:bg-purple-500 hover:text-white transition-all min-h-[44px] flex items-center justify-center"
                        >
                          {wellnessMutation.isPending ? 'Synchronizing...' : 'Log Assessment'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Mini Info card */}
            <div className="space-y-6">
              <div className="hud-glass corner-brackets p-4 md:p-6 space-y-4 border-purple-900/30">
                <h3 className="font-mono text-[10px] text-purple-400 uppercase tracking-[0.3em] border-b border-purple-900/50 pb-2">Cognitive Core</h3>
                <p className="font-mono text-xs text-gray-400 leading-relaxed">
                  Monitoring mental fatigue keeps stress penalties under management. Higher focus scores directly influence study and academic metrics.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ================= BIOMETRICS TAB ================= */}
        {activeTab === 'body' && (
          <>
            {/* Left/Middle Column: Biometrics Data & Chart */}
            <div className="lg:col-span-2 space-y-6">
              {weightTrendData.length < 3 ? (
                <div className="hud-glass corner-brackets p-8 text-center border-yellow-950/50 min-h-[300px] flex flex-col items-center justify-center">
                  <Lock className="w-12 h-12 text-yellow-500 mb-4 drop-shadow-[0_0_10px_#eab308]" />
                  <h3 className="font-display text-xl text-yellow-400 uppercase tracking-widest mb-2">Hunter Data Insufficient</h3>
                  <p className="font-mono text-xs text-gray-500 max-w-md leading-relaxed uppercase">
                    Log biometrics for at least 3 days to unlock advanced body composition analysis and trending projections.
                  </p>
                </div>
              ) : (
                <div className="hud-glass corner-brackets p-4 md:p-6 h-[300px] md:h-[350px] relative flex flex-col justify-between">
                  <div>
                    <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 text-sm md:text-base mb-6">Weight Trend</h2>
                  </div>
                  <div className="flex-1 w-full min-h-[200px]">
                    <ResponsiveContainer width="99%" height="100%">
                      <LineChart data={weightTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <XAxis dataKey="date" stroke="rgba(0,212,255,0.3)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                        <YAxis stroke="rgba(0,212,255,0.3)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,5,11,0.9)', border: '1px solid #00d4ff', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '11px' }} />
                        <Line type="monotone" dataKey="weight" stroke="#00E5FF" strokeWidth={3} dot={{ fill: '#00E5FF', r: 4 }} activeDot={{ r: 6 }} name="Weight (kg)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Composition Chart & Log History */}
              {weightTrendData.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Body Composition Pie */}
                  <div className="hud-glass corner-brackets p-4 md:p-6 flex flex-col items-center">
                    <h3 className="font-display uppercase tracking-[0.2em] text-cyan-500 text-sm mb-4 w-full text-left">Body Composition</h3>
                    <div className="h-44 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={[
                              { name: 'Lean Mass', value: leanBodyMass },
                              { name: 'Fat Mass', value: Number((currentWeight - leanBodyMass).toFixed(1)) }
                            ]} 
                            innerRadius={30} 
                            outerRadius={55} 
                            paddingAngle={5} 
                            dataKey="value"
                          >
                            <Cell fill="#00E5FF" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(0,5,11,0.9)', border: '1px solid #00d4ff', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 font-mono text-[9px] uppercase tracking-widest mt-2">
                      <span className="text-cyan-400">Lean: {leanBodyMass}kg</span>
                      <span className="text-red-400">Fat: {(currentWeight - leanBodyMass).toFixed(1)}kg</span>
                    </div>
                  </div>

                  {/* History Logs */}
                  <div className="hud-glass corner-brackets p-4 md:p-6">
                    <h3 className="font-display uppercase tracking-[0.2em] text-cyan-500 text-sm mb-4">Historical Records</h3>
                    <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                      {analytics.weightTrend.slice().reverse().map((w: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-black/40 border border-cyan-900/30 p-2.5 rounded-lg font-mono text-xs">
                          <span className="text-gray-400">{formatSafeDate(w.loggedAt, 'MM-dd HH:mm')}</span>
                          <span className="text-cyan-400 font-bold">{w.weight} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Biometrics Form & Score */}
            <div className="space-y-6">
              {/* Physical Score */}
              <div className="hud-glass corner-brackets p-6 text-center border-cyan-500/50 shadow-glow-cyan flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Physical Power Index</span>
                <div className="font-display text-5xl font-black text-white text-shadow-glow tracking-widest my-2 animate-pulse">{physicalPowerScore}</div>
                <div className="font-mono text-xs font-bold text-yellow-400 px-4 py-1.5 bg-yellow-950/20 border border-yellow-900/50 rounded-full">
                  Rank: {getPowerRank(physicalPowerScore)}
                </div>
              </div>

              {/* Biometrics Values Grid */}
              <div className="hud-glass corner-brackets p-4 md:p-6 space-y-4">
                <h3 className="font-mono text-[10px] text-cyan-400 uppercase tracking-[0.3em] border-b border-cyan-900/50 pb-2">Status Parameters</h3>
                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <span className="text-gray-500 block uppercase text-[9px] tracking-wider">BMI</span>
                    <span className="text-white text-base font-bold">{bmi}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[9px] tracking-wider">Body Fat</span>
                    <span className="text-white text-base font-bold">{currentBodyFat}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[9px] tracking-wider">Muscle Mass</span>
                    <span className="text-white text-base font-bold">{muscleMass} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[9px] tracking-wider">Lean Mass</span>
                    <span className="text-white text-base font-bold">{leanBodyMass} kg</span>
                  </div>
                </div>
              </div>

              {/* Log Biometrics Form */}
              <div className="hud-glass corner-brackets p-4 md:p-6 relative">
                {isLoggingBiometrics ? (
                  <div className="space-y-4 animate-[fade-in_0.3s_ease-out]">
                    <h3 className="font-mono text-[10px] text-cyan-400 uppercase tracking-[0.3em] border-b border-cyan-900/50 pb-2">Log Biometrics</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Weight (KG)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          value={biometricsForm.weight} 
                          onChange={e => setBiometricsForm({ ...biometricsForm, weight: Number(e.target.value) })} 
                          className="w-full bg-black/50 border border-cyan-900/50 rounded-[2px] px-3 py-2 text-base text-white font-mono focus:border-cyan-400 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Body Fat (%)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          value={biometricsForm.bodyFatPercent} 
                          onChange={e => setBiometricsForm({ ...biometricsForm, bodyFatPercent: Number(e.target.value) })} 
                          className="w-full bg-black/50 border border-cyan-900/50 rounded-[2px] px-3 py-2 text-base text-white font-mono focus:border-cyan-400 focus:outline-none" 
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => setIsLoggingBiometrics(false)} 
                          className="flex-1 py-2 border border-gray-700 text-gray-400 hover:text-white text-xs font-mono uppercase tracking-widest rounded min-h-[44px]"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => biometricsMutation.mutate(biometricsForm)} 
                          disabled={biometricsMutation.isPending}
                          className="flex-[2] py-2 bg-cyan-950 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black text-xs font-mono uppercase tracking-widest font-bold rounded min-h-[44px]"
                        >
                          {biometricsMutation.isPending ? 'Syncing...' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setBiometricsForm({ weight: currentWeight, bodyFatPercent: currentBodyFat });
                      setIsLoggingBiometrics(true);
                    }}
                    className="w-full py-3 bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-900 text-cyan-400 hover:text-cyan-300 font-mono text-xs uppercase tracking-widest rounded transition-all min-h-[44px] flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Upload Biometric Blueprint
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ContributionProgress = ({ label, val, color, max = 100 }: { label: string, val: number, color: string, max?: number }) => {
  const pct = Math.min(100, Math.max(0, (val / max) * 100));
  return (
    <div>
      <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-gray-500 mb-1">
        <span>{label}</span>
        <span className="text-white">{val} / {max}</span>
      </div>
      <div className="h-1.5 w-full bg-cyan-950 border border-cyan-900/30 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default Vitals;
