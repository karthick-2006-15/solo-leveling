import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Terminal, Mic, BookOpen, Compass, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAriaChat, useAriaReports } from '../hooks/useAria';
import { AriaVoiceWave } from '../components/aria/AriaVoiceWave';
import { HunterTrainingBackground } from '../components/training/HunterTrainingBackground';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { Fade, Slide } from '../components/animations/AnimationLibrary';
import { useSystemSound } from '../hooks/useSystemSound';
import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../api/healthApi';
import { useProgression } from '../hooks/useProgression';
import { useMissions } from '../hooks/useMissions';
import { useMonarch } from '../hooks/useMonarch';
import { useAcademics } from '../hooks/useAcademics';
import { AriaCore } from '../components/aria/AriaCore';

const thinkingMessages = [
  "Analyzing Hunter Profile...",
  "Reading Mission Data...",
  "Generating Recommendations...",
  "Synthesizing Neuro-Data...",
  "Calibrating Neural Link..."
];

export const AriaCommandCenter: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'system', content: string }[]>([
    { role: 'system', content: '# IGGRIS ONLINE\n\nI am connected to your Hunter Profile, Shadow Status, and Active Dungeons. Awaiting your orders, Commander.' }
  ]);
  const [input, setInput] = useState('');
  const [activeView, setActiveView] = useState<'dashboard' | 'chat'>('dashboard');
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'responding'>('idle');

  // Boot sequence animation states
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootProgress, setBootProgress] = useState(0);
  const [showBootScreen, setShowBootScreen] = useState(true);

  // Run boot screen load once on mount
  useEffect(() => {
    const lines = [
      "SYSTEM LINK ESTABLISHED",
      "IGGRIS ONLINE",
      "Synchronizing Hunter Data...",
      "Loading Hunter Profile...",
      "Ready."
    ];

    let currentLineIdx = 0;
    const lineTimer = setInterval(() => {
      if (currentLineIdx < lines.length) {
        const nextLine = lines[currentLineIdx];
        setBootLines(prev => [...prev, nextLine]);
        currentLineIdx++;
        setBootProgress((currentLineIdx / lines.length) * 100);
      } else {
        clearInterval(lineTimer);
        setTimeout(() => {
          setShowBootScreen(false);
        }, 800);
      }
    }, 650);

    return () => clearInterval(lineTimer);
  }, []);

  // Hooks data fetching for AI dashboard
  const { progression } = useProgression();
  const { quests } = useMissions();
  const { monarchData } = useMonarch();
  const { profile: academicProfile } = useAcademics();

  const { data: todayStatus } = useQuery({
    queryKey: ['todayStatus'],
    queryFn: async () => {
      const res = await healthApi.getTodayStatus();
      return (await res.json()).data;
    }
  });

  const recoveryScore = todayStatus?.recoveryLog?.recoveryScore ?? 75;
  const dopamineBalance = monarchData?.monarch?.dopamineBalance ?? 90;
  const willpower = monarchData?.monarch?.attributes?.willpower ?? 80;
  const corruption = monarchData?.monarch?.attributes?.corruption ?? 12;

  // Compute system states dynamically based on parameters
  const systemState = (() => {
    if (corruption > 50) return 'critical';
    if (recoveryScore < 40) return 'warning';
    if (dopamineBalance < 30) return 'alert';
    if (progression?.level && progression.level > 15) return 'monarch';
    return 'normal';
  })();

  const chatMutation = useAriaChat();
  const { generateMorning, generateEvening } = useAriaReports();
  const { play } = useSystemSound();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Play boot sound once on mount
  useEffect(() => {
    play('boot');
  }, [play]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  // Thinking Prompts cycler
  const [thinkingIndex, setThinkingIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (chatMutation.isPending) {
      interval = setInterval(() => {
        setThinkingIndex(prev => (prev + 1) % thinkingMessages.length);
      }, 950);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThinkingIndex(0);
    }
    return () => clearInterval(interval);
  }, [chatMutation.isPending]);

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    e?.preventDefault();
    const targetText = (customText || input).trim();
    if (!targetText || chatMutation.isPending) return;

    setInput('');
    play('click');
    setMessages(prev => [...prev, { role: 'user', content: targetText }]);
    setActiveView('chat');

    try {
      const response = await chatMutation.mutateAsync(targetText);
      setMessages(prev => [...prev, { role: 'system', content: response.data.reply }]);
      play('levelUp');
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'system', content: 'SYSTEM ERROR: Connection to Architect lost.' }]);
      play('error');
    }
  };

  const triggerQuickCommand = (command: string) => {
    handleSend(undefined, command);
  };

  // Simulating the Voice Mode recording flows
  const triggerVoiceRecording = () => {
    if (voiceState !== 'idle') return;
    play('click');
    setVoiceState('listening');
    
    // Simulate recording voice input for 2.5s, then type out command
    setTimeout(() => {
      setVoiceState('processing');
      setTimeout(() => {
        setVoiceState('responding');
        // Inject voice scan
        handleSend(undefined, "Initiate System Scan and evaluate recovery matrix.");
        setVoiceState('idle');
      }, 1200);
    }, 2500);
  };

  const handleMorningReport = async () => {
    try {
      play('click');
      setMessages(prev => [...prev, { role: 'user', content: 'Generate Morning Briefing' }]);
      setActiveView('chat');
      const res = await generateMorning.mutateAsync();
      setMessages(prev => [...prev, { role: 'system', content: res.data.report.content }]);
      play('levelUp');
    } catch (err) {
      console.error('Failed to generate morning report', err);
    }
  };

  const handleEveningReport = async () => {
    try {
      play('click');
      setMessages(prev => [...prev, { role: 'user', content: 'Generate Evening Summary' }]);
      setActiveView('chat');
      const res = await generateEvening.mutateAsync();
      setMessages(prev => [...prev, { role: 'system', content: res.data.report.content }]);
      play('levelUp');
    } catch (err) {
      console.error('Failed to generate evening report', err);
    }
  };

  // Smart Greeting dynamic compiler
  const getSmartGreeting = () => {
    let msg = `Welcome back. Sync status: SECURE. System Mode: ${systemState.toUpperCase()}.\n\n`;
    if (recoveryScore < 50) {
      msg += `⚠️ Warning: Recovery score is low (${recoveryScore}%). Active Fatigue penalty detected. Plan light activities.\n\n`;
    } else {
      msg += `⚡ Physical Recovery at peak condition (${recoveryScore}%).\n\n`;
    }
    if (academicProfile?.assignmentsPending > 0) {
      msg += `📚 Academic alert: ${academicProfile.assignmentsPending} pending assignments. Highest priority: DBMS Assignment.\n\n`;
    }
    const completedMissionsCount = quests?.filter((q: any) => q.completed).length ?? 0;
    const totalMissionsCount = quests?.length ?? 0;
    if (totalMissionsCount > 0) {
      msg += `🎯 Conditioning objectives: Completed ${completedMissionsCount}/${totalMissionsCount} daily missions.`;
    }
    return msg;
  };

  // Color mapping based on system state
  const stateThemes = {
    normal: { border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-[0_0_15px_rgba(0,229,255,0.15)]', badge: 'bg-cyan-950/60 border-cyan-800 text-cyan-400' },
    alert: { border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'shadow-[0_0_15px_rgba(255,183,3,0.15)]', badge: 'bg-yellow-950/60 border-yellow-800 text-yellow-400' },
    warning: { border: 'border-orange-500/30', text: 'text-orange-400', glow: 'shadow-[0_0_15px_rgba(255,122,0,0.15)]', badge: 'bg-orange-950/60 border-orange-800 text-orange-400' },
    critical: { border: 'border-rose-500/30', text: 'text-rose-400', glow: 'shadow-[0_0_15px_rgba(255,0,84,0.15)]', badge: 'bg-rose-950/60 border-rose-800 text-rose-400' },
    emergency: { border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]', badge: 'bg-red-950/60 border-red-800 text-red-400' },
    monarch: { border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(157,78,221,0.2)]', badge: 'bg-purple-950/60 border-purple-800 text-purple-400' }
  };
  const theme = stateThemes[systemState];

  return (
    <>
      {/* 1. Fullscreen Opening Boot Screen animation */}
      <AnimatePresence>
        {showBootScreen && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[999] flex flex-col items-center justify-center p-6 text-center font-mono"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent pointer-events-none" />
            
            <div className="space-y-6 max-w-md w-full relative z-10">
              <AriaCore size={100} state="normal" animate={true} />
              
              <div className="space-y-2 text-left bg-slate-950/80 border border-cyan-950 p-6 rounded-lg font-mono text-xs">
                {bootLines.map((line, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={line === "Ready." ? "text-green-400 font-bold" : line?.includes("ONLINE") || line?.includes("ESTABLISHED") ? "text-cyan-400 font-bold" : "text-gray-300"}
                  >
                    &gt; {line}
                  </motion.div>
                ))}
              </div>

              {/* Progress Bar indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] text-gray-500 font-bold tracking-widest">
                  <span>LOADING COGNITIVE INTERFACES</span>
                  <span>{Math.round(bootProgress)}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${bootProgress}%` }}
                    transition={{ ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Fade className="flex flex-col h-full bg-black relative">
        <HunterTrainingBackground />
        
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        {/* Dynamic scanline color mapping */}
        <motion.div 
          animate={{ y: ["-100%", "100%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none z-0`}
        />

        {/* IGGRIS CHAT HEADER PANEL */}
        <div className="relative z-10 p-4 border-b border-[var(--color-system-border)] bg-black/80 backdrop-blur-xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex items-center gap-4">
            <AriaCore size={40} state={systemState} />
            <div>
              <h1 className={`text-xl font-display font-bold uppercase tracking-widest ${theme.text}`}>
                IGGRIS
              </h1>
              <div className="text-[10px] font-mono text-gray-400 mt-0.5 uppercase tracking-wider">
                Commander, <span className="text-cyan-400 font-bold">Awaiting your orders.</span>
              </div>
            </div>
          </div>

          {/* Connection status badges */}
          <div className="flex flex-wrap gap-2 md:gap-3 font-mono text-[9px]">
            <span className="px-2.5 py-1 bg-cyan-950/40 border border-cyan-800 text-cyan-400 rounded">
              Hunter Link: Connected
            </span>
            <span className="px-2.5 py-1 bg-blue-950/40 border border-blue-800 text-blue-400 rounded">
              Mission Database: Synced
            </span>
            <span className={`px-2.5 py-1 border rounded ${theme.badge}`}>
              System Status: Active
            </span>
          </div>

          {/* View Toggle (HUD vs Chat) */}
          <div className="flex gap-2 font-mono text-[10px]">
            <button 
              onClick={() => setActiveView('dashboard')}
              className={`px-4 py-2 border rounded font-bold uppercase tracking-wider transition-colors min-h-[44px] md:min-h-0 flex-1 md:flex-none text-center ${activeView === 'dashboard' ? 'bg-cyan-950/80 border-cyan-500 text-cyan-400' : 'bg-black/40 border-gray-800 text-gray-400 hover:text-white'}`}
            >
              Core HUD
            </button>
            <button 
              onClick={() => setActiveView('chat')}
              className={`px-4 py-2 border rounded font-bold uppercase tracking-wider transition-colors min-h-[44px] md:min-h-0 flex-1 md:flex-none text-center ${activeView === 'chat' ? 'bg-cyan-950/80 border-cyan-500 text-cyan-400' : 'bg-black/40 border-gray-800 text-gray-400 hover:text-white'}`}
            >
              Neural Chat ({messages.length - 1})
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS ROUTER LINK BAR */}
        <div className="relative z-10 px-4 py-2 border-b border-[var(--color-system-border)] bg-black/60 backdrop-blur-md flex overflow-x-auto gap-2 md:gap-4 custom-scrollbar -mx-0">
          <Link to="/aria-planner" className="flex-shrink-0 text-cyan-400 border border-cyan-500/30 px-3 md:px-4 py-2 min-h-[44px] flex items-center rounded text-xs font-bold tracking-widest hover:bg-cyan-900/30">LIFE PLANNER</Link>
          <Link to="/career" className="flex-shrink-0 text-blue-400 border border-blue-500/30 px-3 md:px-4 py-2 min-h-[44px] flex items-center rounded text-xs font-bold tracking-widest hover:bg-blue-900/30">CAREER INTEL</Link>
          <Link to="/academics" className="flex-shrink-0 text-purple-400 border border-purple-500/30 px-3 md:px-4 py-2 min-h-[44px] flex items-center rounded text-xs font-bold tracking-widest hover:bg-purple-900/30">ACADEMICS</Link>
          <Link to="/finance" className="flex-shrink-0 text-green-400 border border-green-500/30 px-3 md:px-4 py-2 min-h-[44px] flex items-center rounded text-xs font-bold tracking-widest hover:bg-green-900/30">FINANCE</Link>
          <button onClick={handleMorningReport} className="flex-shrink-0 text-blue-400 border border-blue-500/30 px-3 md:px-4 py-2 min-h-[44px] flex items-center rounded text-xs font-bold tracking-widest hover:bg-blue-900/30 font-mono">MORNING BRIEF</button>
          <button onClick={handleEveningReport} className="flex-shrink-0 text-purple-400 border border-purple-500/30 px-3 md:px-4 py-2 min-h-[44px] flex items-center rounded text-xs font-bold tracking-widest hover:bg-purple-900/30 font-mono">EVENING BRIEF</button>
        </div>

        {/* CORE DISPLAY WORKSPACE */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 custom-scrollbar pb-28 md:pb-32">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              
              {/* VIEW A: DYNAMIC AI HUD DASHBOARD */}
              {activeView === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  {/* Left/Middle Column - Status Parameters */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Smart greeting & Analysis */}
                    <div className="bg-black/60 border border-cyan-900/40 rounded-xl p-5 backdrop-blur-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Terminal className="w-32 h-32 text-cyan-400" />
                      </div>
                      <h3 className="font-mono text-[10px] text-cyan-500 uppercase tracking-[0.3em] mb-3">AI Smart Briefing</h3>
                      <div className="font-mono text-xs text-white leading-relaxed whitespace-pre-line">
                        {getSmartGreeting()}
                      </div>
                    </div>

                    {/* Monarch parameters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-black/60 border border-cyan-900/40 p-4 rounded-xl font-mono">
                        <span className="text-[9px] text-gray-500 block uppercase tracking-wider">Willpower</span>
                        <span className="text-xl font-bold text-cyan-400 mt-1 block">{willpower}%</span>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${willpower}%` }} />
                        </div>
                      </div>
                      <div className="bg-black/60 border border-cyan-900/40 p-4 rounded-xl font-mono">
                        <span className="text-[9px] text-gray-500 block uppercase tracking-wider">Dopamine Balance</span>
                        <span className="text-xl font-bold text-purple-400 mt-1 block">{dopamineBalance}%</span>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-purple-400 h-full rounded-full" style={{ width: `${dopamineBalance}%` }} />
                        </div>
                      </div>
                      <div className="bg-black/60 border border-cyan-900/40 p-4 rounded-xl font-mono">
                        <span className="text-[9px] text-gray-500 block uppercase tracking-wider">System Corruption</span>
                        <span className="text-xl font-bold text-rose-400 mt-1 block">{corruption}%</span>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-rose-400 h-full rounded-full" style={{ width: `${corruption}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Missions Board and Dungeons */}
                    <div className="bg-black/60 border border-cyan-900/40 p-5 rounded-xl backdrop-blur-md">
                      <h3 className="font-display font-bold uppercase text-sm tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
                        <Award className="w-4 h-4 text-cyan-500" /> Active Operations & Targets
                      </h3>
                      
                      <div className="space-y-3 font-mono text-xs">
                        {quests.slice(0, 3).map((quest: any, idx: number) => (
                          <div key={quest._id || quest.id || idx} className="flex justify-between items-center bg-black/40 p-3 border border-white/5 rounded">
                            <span className="text-white uppercase font-bold">{quest.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] ${quest.completed ? 'bg-green-950/40 text-green-400 border border-green-800' : 'bg-yellow-950/40 text-yellow-400 border border-yellow-800'}`}>
                              {quest.completed ? 'CLEARED' : 'PENDING'}
                            </span>
                          </div>
                        ))}
                        {quests.length === 0 && (
                          <div className="text-center py-6 text-gray-600">No active daily quests loaded.</div>
                        )}
                      </div>
                    </div>

                    {/* Academic Status */}
                    <div className="bg-black/60 border border-purple-950/40 p-5 rounded-xl backdrop-blur-md">
                      <h3 className="font-display font-bold uppercase text-sm tracking-widest text-purple-400 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-500" /> Academic Metrics & Deadlines
                      </h3>
                      <div className="grid grid-cols-2 gap-4 font-mono text-xs text-white">
                        <div className="bg-purple-950/10 border border-purple-900/30 p-3 rounded">
                          <span className="text-[9px] text-gray-500 block uppercase">GPA Index</span>
                          <span className="text-lg font-bold text-purple-400 block mt-1">{academicProfile?.cgpa?.toFixed(2) || '0.00'} CGPA</span>
                        </div>
                        <div className="bg-purple-950/10 border border-purple-900/30 p-3 rounded">
                          <span className="text-[9px] text-gray-500 block uppercase">Semester</span>
                          <span className="text-lg font-bold text-white block mt-1">Semester {academicProfile?.currentSemester || 1}</span>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 font-mono text-xs">
                        <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/5">
                          <span className="text-gray-400">PENDING ASSIGNMENTS:</span>
                          <span className="text-yellow-400 font-bold">{academicProfile?.assignmentsPending || 0}</span>
                        </div>
                        <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/5">
                          <span className="text-gray-400">UPCOMING EXAMS:</span>
                          <span className="text-rose-400 font-bold">{academicProfile?.examsUpcoming || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - AI Core visual & Quick Commands */}
                  <div className="space-y-6">
                    
                    {/* Holographic AI Core visual */}
                    <div className="bg-black/60 border border-cyan-900/40 rounded-xl p-6 backdrop-blur-md flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <AriaCore size={140} state={systemState} className="mb-4" />
                      <h4 className="font-display font-bold uppercase tracking-widest text-white text-sm">Iggris Core Terminal</h4>
                      <span className="font-mono text-[9px] text-cyan-500 uppercase tracking-widest mt-1 block">NEURAL LINK ACTIVE</span>
                    </div>

                    {/* System Recommendations Panel */}
                    <div className="bg-black/60 border border-cyan-900/40 rounded-xl p-5 backdrop-blur-md">
                      <h4 className="font-display font-bold uppercase tracking-widest text-cyan-400 text-xs mb-3 flex items-center gap-1.5">
                        <Compass className="w-4 h-4" /> Directives
                      </h4>
                      <div className="space-y-2.5 font-mono text-[11px] text-gray-400 leading-relaxed">
                        <p className="flex gap-2">
                          <span className="text-cyan-500">•</span>
                          <span>Optimize hydration: Intake 750ml water immediately.</span>
                        </p>
                        <p className="flex gap-2">
                          <span className="text-cyan-500">•</span>
                          <span>Study DB assignment: Submit before 23:59 target deadline.</span>
                        </p>
                        <p className="flex gap-2">
                          <span className="text-cyan-500">•</span>
                          <span>Boss Fight ready: Initiate boss combat sequence inside HQ.</span>
                        </p>
                      </div>
                    </div>

                    {/* Intelligent Command chips */}
                    <div className="bg-black/60 border border-cyan-900/40 rounded-xl p-5 backdrop-blur-md">
                      <h4 className="font-display font-bold uppercase tracking-widest text-cyan-400 text-xs mb-4">Command Chips</h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Generate Today's Missions",
                          "System Scan",
                          "Analyze My Progress",
                          "Boss Status",
                          "Recovery Report",
                          "Nutrition",
                          "Workout",
                          "Focus Mode",
                          "Emergency Mode"
                        ].map((cmd, idx) => (
                          <button
                            key={idx}
                            onClick={() => triggerQuickCommand(cmd)}
                            className="px-3 py-1.5 bg-cyan-950/40 border border-cyan-900/60 hover:border-cyan-400 text-cyan-300 hover:text-white rounded-[2px] font-mono text-[10px] uppercase tracking-wider transition-colors min-h-[36px]"
                          >
                            {cmd}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* VIEW B: NEURAL LINK CONVERSATION VIEW */}
              {activeView === 'chat' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-4xl mx-auto flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-6">
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 md:p-5 relative overflow-hidden shadow-lg ${
                          msg.role === 'user' 
                            ? 'bg-[var(--color-system-dark)] border border-gray-700 rounded-br-none' 
                            : 'bg-black/80 border border border-[var(--color-system-border)] rounded-bl-none'
                        }`}>
                          {msg.role === 'system' && (
                            <div className={`absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,212,255,0.8)]`} />
                          )}
                          
                          <div className="prose prose-invert prose-cyan max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Thinking status indicators */}
                    {chatMutation.isPending && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="max-w-[85%] bg-black/80 border border-[var(--color-system-border)] rounded-2xl rounded-bl-none p-5 flex flex-col gap-3">
                          <div className="flex items-center gap-4">
                            <AriaVoiceWave isSpeaking={true} />
                            <span className="text-cyan-400 font-mono text-sm uppercase tracking-widest animate-pulse font-bold">
                              {thinkingMessages[thinkingIndex]}
                            </span>
                          </div>
                          {/* Dynamic Progress indicator */}
                          <div className="w-48 bg-cyan-950 h-1.5 rounded-full overflow-hidden relative">
                            <motion.div 
                              animate={{ left: ["-100%", "100%"] }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute top-0 bottom-0 w-1/3 bg-cyan-400 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Voice listening indicators bar */}
        {voiceState !== 'idle' && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black/90 border border-cyan-500/80 px-6 py-3.5 rounded-full flex items-center gap-4 shadow-[0_0_30px_rgba(0,229,255,0.3)] animate-pulse">
            <AriaVoiceWave isSpeaking={voiceState === 'listening'} />
            <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-bold">
              {voiceState === 'listening' ? 'LISTENING (SPEECH INPUT)...' : 'INTERFACES PROCESSING...'}
            </span>
          </div>
        )}

        {/* Input Form Area */}
        <Slide direction="up" distance={50} className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 p-2 md:p-4 border-t border-gray-800 bg-black/90 backdrop-blur-xl z-20 safe-area-bottom">
          <form onSubmit={(e) => handleSend(e)} className="max-w-4xl mx-auto flex gap-2 md:gap-3 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Command Iggris..."
              className="flex-1 bg-[var(--color-system-dark)] border border-gray-700 rounded-xl px-3 md:px-4 py-3 md:py-4 text-base text-white focus:outline-none focus:border-cyan-500 font-sans transition-colors"
              disabled={chatMutation.isPending}
            />
            <button
              type="button"
              onClick={triggerVoiceRecording}
              disabled={chatMutation.isPending || voiceState !== 'idle'}
              className={`w-12 h-12 md:w-14 md:h-14 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-gray-800 text-gray-400 hover:text-cyan-400 transition-colors border border-gray-700 ${voiceState === 'listening' ? 'text-cyan-400 border-cyan-400 bg-cyan-950/20' : ''}`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <PrimaryButton 
              type="submit" 
              disabled={!input.trim() || chatMutation.isPending}
              className="w-12 h-12 md:w-14 md:h-14 min-h-[44px] min-w-[44px] !p-0 flex items-center justify-center rounded-xl"
            >
              <Send className="w-5 h-5" />
            </PrimaryButton>
          </form>
        </Slide>
      </Fade>
    </>
  );
};
export default AriaCommandCenter;
