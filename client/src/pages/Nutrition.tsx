import React, { useState } from 'react';
import { SystemWindow } from '../components/ui/SystemWindow';
import { PageHeader } from '../components/ui/PageHeader';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { LevelUpModal } from '../components/ui/LevelUpModal';
import { AchievementToast, type ToastData } from '../components/ui/AchievementToast';
import { WaterTracker } from '../components/nutrition/WaterTracker';
import { useNutrition } from '../hooks/useNutrition';
import { Utensils, Trash2, Edit3, Activity, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatSafeDate } from '../utils/dateUtils';
import { NutritionScannerHUD } from '../components/nutrition/NutritionScannerHUD';
import { FoodHunterCard } from '../components/nutrition/FoodHunterCard';
import { HunterBackground } from '../components/nutrition/HunterBackground';
import { HunterMissionBar } from '../components/nutrition/HunterMissionBars';
import type { NutritionAnalysisResult } from '../types/nutrition';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type LogMode = 'search' | 'manual';

export const Nutrition: React.FC = () => {
  const { logs, summary, isLoading, logFood, logManualFood, deleteLog } = useNutrition();
  
  const [activeTab, setActiveTab] = useState<MealType>('breakfast');
  const [logMode, setLogMode] = useState<LogMode>('search');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio Context Helpers
  const playSound = (freq: number, type: OscillatorType, duration: number) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch(e) {}
  };

  const playScanStart = () => playSound(600, 'sine', 0.8);
  const playScanComplete = () => { playSound(1200, 'sine', 0.1); setTimeout(() => playSound(1800, 'sine', 0.3), 150); };
  const playConfirm = () => playSound(300, 'square', 0.4);
  const playLevelUp = () => { playSound(400, 'sine', 0.2); setTimeout(() => playSound(600, 'sine', 0.4), 200); };

  
  // Scanner Mode State
  const [scannerInput, setScannerInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<NutritionAnalysisResult | null>(null);

  const handleSystemScan = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const queryText = overrideText || scannerInput;
    if (!queryText.trim()) return;

    playScanStart();
    setIsScanning(true);
    setAnalysisResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/nutrition/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: scannerInput })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAnalysisResult(data.data);
        playScanComplete();
      } else {
        alert(data.message || 'Scan failed.');
      }
    } catch (err) {
      console.error('Scan failed', err);
    } finally {
      setIsScanning(false);
    }
  };

  const [manualForm, setManualForm] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0
  });

  // Modals and Toasts
  const [levelUpData, setLevelUpData] = useState<{isOpen: boolean, level: number, rank?: string, rankChanged?: boolean}>({ isOpen: false, level: 0 });
  const [toasts, setToasts] = useState<ToastData[]>([]);

  if (isLoading) return <div className="text-center mt-20 text-[var(--color-system-blue)] font-mono animate-pulse">SYSTEM SCANNING...</div>;

  // Defaults
  const calorieTarget = 2000;
  const proteinTarget = 100;

  // Calculate today's totals from logs
  const todayCalories = logs.reduce((sum: number, log: any) => sum + log.nutrients.calories, 0);
  const todayProtein = logs.reduce((sum: number, log: any) => sum + log.nutrients.protein, 0);
  const todayCarbs = logs.reduce((sum: number, log: any) => sum + log.nutrients.carbs, 0);
  const todayFat = logs.reduce((sum: number, log: any) => sum + log.nutrients.fat, 0);

  const handleConfirmMeal = async () => {
    if (!analysisResult || analysisResult.detectedFoods.length === 0) return;
    
    try {
      // Log each food
      for (const food of analysisResult.detectedFoods) {
        const data = {
          mealType: activeTab,
          rawDescription: `${food.quantity} ${food.unit} ${food.foodName}`,
          servingDescription: `${food.quantity} ${food.unit} (${food.estimatedWeightGrams}g)`,
          nutrients: {
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat
          },
          source: 'manual' as const
        };
        const result = await logFood(data);
        handleXPResult(result);
      }
      
      playConfirm();
      setAnalysisResult(null);
      setScannerInput('');
    } catch {
      alert("Failed to log meal.");
    }
  };

  const handleManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name || manualForm.calories <= 0) return alert("Valid name and calories required");
    
    try {
      const data = {
        mealType: activeTab,
        rawDescription: manualForm.name,
        servingDescription: '1 serving (manual)',
        nutrients: {
          calories: Number(manualForm.calories),
          protein: Number(manualForm.protein),
          carbs: Number(manualForm.carbs),
          fat: Number(manualForm.fat),
          fiber: Number(manualForm.fiber),
          sugar: Number(manualForm.sugar)
        },
        source: 'manual' as const
      };

      const result = await logManualFood(data);
      handleXPResult(result);
      setManualForm({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 });
    } catch {
      alert("Failed to log manual food.");
    }
  };

  const handleXPResult = (result: any) => {
    if (result.xpResults && result.xpResults.length > 0) {
      const newToasts: ToastData[] = [];
      result.xpResults.forEach((xpRow: any) => {
        newToasts.push({
          id: Math.random().toString(36).substring(2),
          title: `Goal Met!`,
          description: `You hit your ${xpRow.source.replace('_goal_met', '')} goal!`,
          icon: '🌟'
        });
        if (xpRow.result.leveledUp) {
          playLevelUp();
          setLevelUpData({
            isOpen: true,
            level: xpRow.result.newLevel,
            rank: xpRow.result.newRank,
            rankChanged: xpRow.result.rankChanged
          });
        }
      });
      setToasts(prev => [...prev, ...newToasts]);
    }
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const graphData = summary.map((s: any) => ({
    date: formatSafeDate(s.date, 'MMM dd'),
    calories: s.calories,
    protein: s.protein
  }));

  const logsForTab = logs.filter((l: any) => l.mealType === activeTab);

  return (
    <div className="relative min-h-screen text-white font-mono">
      <HunterBackground />
      <div className="space-y-6 pb-20 md:pb-8 relative z-10">
      <AchievementToast toasts={toasts} removeToast={removeToast} />
      <LevelUpModal 
        isOpen={levelUpData.isOpen} 
        onClose={() => setLevelUpData({ ...levelUpData, isOpen: false })}
        newLevel={levelUpData.level}
        newRank={levelUpData.rank}
        rankChanged={levelUpData.rankChanged}
      />

      <div className="flex items-center justify-between">
        <PageHeader 
          title="Nutrition Command" 
          subtitle="Fuel tracking and metabolic analysis." 
        />
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded border text-[10px] font-mono tracking-widest uppercase transition-colors ${soundEnabled ? 'border-cyan-500 text-cyan-400 bg-cyan-950/40' : 'border-gray-700 text-gray-500 bg-black/40'}`}
        >
          {soundEnabled ? 'Audio: ON' : 'Audio: OFF'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Macros & Water */}
        <div className="space-y-6">
          <SystemWindow title="Metabolic Intake" className="h-auto">
            <div className="space-y-6 pt-2">
              <HunterMissionBar label="Energy" current={todayCalories} max={calorieTarget} unit="KCAL" colorHex="#00d4ff" />
              <HunterMissionBar label="Protein" current={todayProtein} max={proteinTarget} unit="G" colorHex="#00d4ff" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center mt-8">
              <div className="bg-[rgba(255,255,255,0.02)] rounded-[2px] p-4 border border-[rgba(255,255,255,0.05)]">
                <div className="text-[20px] font-mono font-bold text-white mb-1">{todayCarbs.toFixed(0)}g</div>
                <div className="text-[10px] text-[var(--color-system-text-dim)] font-mono uppercase tracking-widest">Carbs</div>
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] rounded-[2px] p-4 border border-[rgba(255,255,255,0.05)]">
                <div className="text-[20px] font-mono font-bold text-white mb-1">{todayFat.toFixed(0)}g</div>
                <div className="text-[10px] text-[var(--color-system-text-dim)] font-mono uppercase tracking-widest">Fat</div>
              </div>
            </div>
          </SystemWindow>

          <WaterTracker />
        </div>

        {/* Middle Col: Food Logging */}
        <div className="lg:col-span-2 space-y-6">
          <SystemWindow title="Intake Logging">
            <div className="flex bg-[rgba(0,0,0,0.4)] rounded-[2px] p-1 mb-6 border border-[rgba(255,255,255,0.05)]">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as MealType)}
                  className={`flex-1 py-2.5 rounded-[2px] text-[11px] font-mono font-bold tracking-widest uppercase transition-colors ${
                    activeTab === tab 
                      ? 'bg-[rgba(0,212,255,0.1)] text-[var(--color-system-blue)] border border-[rgba(0,212,255,0.3)]' 
                      : 'text-[var(--color-system-text-dim)] hover:text-white border border-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex gap-4 mb-6 border-b border-[rgba(255,255,255,0.1)] pb-4">
              <button 
                onClick={() => setLogMode('search')}
                className={`flex items-center gap-2 text-[12px] font-mono tracking-widest uppercase pb-2 border-b-2 transition-colors ${logMode === 'search' ? 'border-[var(--color-system-blue)] text-[var(--color-system-blue)]' : 'border-transparent text-[var(--color-system-text-dim)] hover:text-white'}`}
              >
                <Search size={14} /> Database Search
              </button>
              <button 
                onClick={() => setLogMode('manual')}
                className={`flex items-center gap-2 text-[12px] font-mono tracking-widest uppercase pb-2 border-b-2 transition-colors ${logMode === 'manual' ? 'border-[var(--color-system-blue)] text-[var(--color-system-blue)]' : 'border-transparent text-[var(--color-system-text-dim)] hover:text-white'}`}
              >
                <Edit3 size={14} /> Manual Entry
              </button>
            </div>

            {logMode === 'search' ? (
              <div className="space-y-4">
                
                <NutritionScannerHUD 
                  isScanning={isScanning}
                  inputText={scannerInput}
                  setInputText={setScannerInput}
                  onAnalyze={() => handleSystemScan()}
                />

                {analysisResult && !isScanning && (
                  <div className="animate-[fade-in_0.3s_ease-out] mt-6">
                    
                    {/* Premium Hunter Analysis Panel */}
                    <div className="mb-6 p-5 bg-black/60 border border-cyan-800 rounded relative overflow-hidden backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="p-3 bg-cyan-950 border border-cyan-500/50 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                          <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-display text-xl text-cyan-400 uppercase tracking-[0.2em] mb-1 text-shadow-glow">System Analysis</h4>
                          <p className="text-[13px] text-cyan-100/90 font-mono leading-relaxed">{analysisResult.systemAnalysis}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {analysisResult.detectedFoods.map((food, idx) => (
                        <FoodHunterCard 
                          key={idx} 
                          food={food} 
                          onConfirm={handleConfirmMeal} 
                          onReject={() => setAnalysisResult(null)}
                          onReScan={(alt) => {
                             setScannerInput(alt);
                             handleSystemScan(undefined, alt);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleManualLog} className="space-y-4 mb-8 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[2px] p-6">
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-[var(--color-system-text-dim)] uppercase">Food Designation</label>
                  <input 
                    required 
                    value={manualForm.name}
                    onChange={e => setManualForm({...manualForm, name: e.target.value})}
                    className="w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--color-system-blue)] text-white p-3 mt-1 text-[14px] font-display uppercase tracking-wide outline-none transition-colors"
                    placeholder="E.G. CUSTOM PROTEIN SHAKE"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-[9px] font-mono tracking-widest text-[var(--color-system-text-dim)] uppercase">Calories</label>
                    <input type="number" required min="1" value={manualForm.calories || ''} onChange={e => setManualForm({...manualForm, calories: Number(e.target.value)})} className="w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--color-system-blue)] text-white p-2 mt-1 text-[12px] font-mono text-center outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono tracking-widest text-[var(--color-system-text-dim)] uppercase">Protein (g)</label>
                    <input type="number" min="0" value={manualForm.protein || ''} onChange={e => setManualForm({...manualForm, protein: Number(e.target.value)})} className="w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--color-system-blue)] text-white p-2 mt-1 text-[12px] font-mono text-center outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono tracking-widest text-[var(--color-system-text-dim)] uppercase">Carbs (g)</label>
                    <input type="number" min="0" value={manualForm.carbs || ''} onChange={e => setManualForm({...manualForm, carbs: Number(e.target.value)})} className="w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--color-system-blue)] text-white p-2 mt-1 text-[12px] font-mono text-center outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono tracking-widest text-[var(--color-system-text-dim)] uppercase">Fat (g)</label>
                    <input type="number" min="0" value={manualForm.fat || ''} onChange={e => setManualForm({...manualForm, fat: Number(e.target.value)})} className="w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--color-system-blue)] text-white p-2 mt-1 text-[12px] font-mono text-center outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono tracking-widest text-[var(--color-system-text-dim)] uppercase">Fiber (g)</label>
                    <input type="number" min="0" value={manualForm.fiber || ''} onChange={e => setManualForm({...manualForm, fiber: Number(e.target.value)})} className="w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--color-system-blue)] text-white p-2 mt-1 text-[12px] font-mono text-center outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono tracking-widest text-[var(--color-system-text-dim)] uppercase">Sugar (g)</label>
                    <input type="number" min="0" value={manualForm.sugar || ''} onChange={e => setManualForm({...manualForm, sugar: Number(e.target.value)})} className="w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--color-system-blue)] text-white p-2 mt-1 text-[12px] font-mono text-center outline-none transition-colors" />
                  </div>
                </div>
                <PrimaryButton type="submit" fullWidth className="mt-4 !py-3">LOG MANUAL ENTRY</PrimaryButton>
              </form>
            )}

            {/* List */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-[14px] uppercase tracking-widest text-[var(--color-system-text-dim)] flex items-center gap-2 mb-4 border-b border-[rgba(255,255,255,0.1)] pb-2">
                <Utensils size={14} /> Logged {activeTab}
              </h3>
              {logsForTab.map((log: any) => (
                <div key={log._id} className="flex justify-between items-center p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[2px] hover:bg-[rgba(255,255,255,0.05)] transition-colors group">
                  <div>
                    <div className="font-display font-bold text-[14px] text-white uppercase tracking-wider mb-1">{log.rawDescription}</div>
                    <div className="text-[10px] font-mono text-[var(--color-system-text-dim)] uppercase tracking-widest">
                      {log.servingDescription} • {log.nutrients.calories.toFixed(0)} KCAL • {log.nutrients.protein.toFixed(1)}G PRO
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteLog(log._id)}
                    className="p-2 text-[var(--color-system-text-dim)] opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {logsForTab.length === 0 && <p className="text-[11px] font-mono text-[var(--color-system-text-dim)] uppercase tracking-widest text-center py-8">No intake logged.</p>}
            </div>
          </SystemWindow>

          <SystemWindow title="Energy Trend" className="h-[300px]" innerClassName="p-4 pt-6 h-full flex flex-col">
            <div className="flex-1 min-h-0 w-full">
              {graphData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData}>
                    <defs>
                      <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-system-blue)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-system-blue)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" width={40} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} 
                    />
                    <Area type="monotone" dataKey="calories" stroke="var(--color-system-blue)" strokeWidth={2} fillOpacity={1} fill="url(#colorCal)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[11px] font-mono text-[var(--color-system-text-dim)] uppercase tracking-widest">Insufficient Data</div>
              )}
            </div>
          </SystemWindow>
        </div>

      </div>
      </div>
    </div>
  );
};

