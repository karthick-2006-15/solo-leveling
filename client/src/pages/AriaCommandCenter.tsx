import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal, Mic, Activity, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAriaChat, useAriaReports } from '../hooks/useAria';
import { AriaVoiceWave } from '../components/aria/AriaVoiceWave';
import { HunterTrainingBackground } from '../components/training/HunterTrainingBackground';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { Fade, Slide } from '../components/animations/AnimationLibrary';
import { useSystemSound } from '../hooks/useSystemSound';

export const AriaCommandCenter: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'system', content: string }[]>([
    { role: 'system', content: '# ARIA ONLINE\n\nI am connected to your Hunter Profile, Shadow Status, and Active Dungeons. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  
  const chatMutation = useAriaChat();
  const { generateMorning, generateEvening } = useAriaReports();
  const { play, playBGM } = useSystemSound();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    playBGM('focus'); // Dynamic background music for Aria
  }, [playBGM]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput('');
    play('click');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await chatMutation.mutateAsync(userMessage);
      setMessages(prev => [...prev, { role: 'system', content: response.data.reply }]);
      play('levelUp');
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'system', content: 'SYSTEM ERROR: Connection to Architect lost.' }]);
      play('error');
    }
  };

  const handleMorningReport = async () => {
    try {
      play('click');
      setMessages(prev => [...prev, { role: 'user', content: 'Generate Morning Briefing' }]);
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
      const res = await generateEvening.mutateAsync();
      setMessages(prev => [...prev, { role: 'system', content: res.data.report.content }]);
      play('levelUp');
    } catch (err) {
      console.error('Failed to generate evening report', err);
    }
  };

  return (
    <Fade className="flex flex-col h-full bg-black relative">
      <HunterTrainingBackground />
      
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      
      {/* Radar Sweep / Scanline Animation */}
      <motion.div 
        animate={{ y: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent pointer-events-none z-0"
      />

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-[var(--color-system-border)] bg-black/80 backdrop-blur-xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-display font-bold uppercase tracking-widest text-cyan-400 drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]">
            ARIA SYSTEM
          </h1>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleMorningReport} className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-900/40 border border-blue-500/50 text-blue-400 hover:bg-blue-800/60 transition-colors text-xs font-mono uppercase tracking-wider">
            <Activity className="w-3 h-3" /> Morning
          </button>
          <button onClick={handleEveningReport} className="flex items-center gap-2 px-3 py-1.5 rounded bg-purple-900/40 border border-purple-500/50 text-purple-400 hover:bg-purple-800/60 transition-colors text-xs font-mono uppercase tracking-wider">
            <BookOpen className="w-3 h-3" /> Evening
          </button>
        </div>
      </div>

      {/* Quick Navigation Dashboards */}
      <div className="relative z-10 px-4 py-2 border-b border-[var(--color-system-border)] bg-black/60 backdrop-blur-md flex justify-between overflow-x-auto gap-4 custom-scrollbar">
        <Link to="/aria-planner" className="flex-shrink-0 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded text-xs font-bold tracking-widest hover:bg-cyan-900/30">LIFE PLANNER</Link>
        <Link to="/career" className="flex-shrink-0 text-blue-400 border border-blue-500/30 px-4 py-2 rounded text-xs font-bold tracking-widest hover:bg-blue-900/30">CAREER INTEL</Link>
        <Link to="/academics" className="flex-shrink-0 text-purple-400 border border-purple-500/30 px-4 py-2 rounded text-xs font-bold tracking-widest hover:bg-purple-900/30">ACADEMICS</Link>
        <Link to="/finance" className="flex-shrink-0 text-green-400 border border-green-500/30 px-4 py-2 rounded text-xs font-bold tracking-widest hover:bg-green-900/30">FINANCE</Link>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 custom-scrollbar pb-32">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <AnimatePresence initial={false}>
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
                    : 'bg-black/80 border border-[var(--color-system-border)] rounded-bl-none'
                }`}>
                  {msg.role === 'system' && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
                  )}
                  
                  <div className="prose prose-invert prose-cyan max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {chatMutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="max-w-[85%] bg-black/80 border border-[var(--color-system-border)] rounded-2xl rounded-bl-none p-4 flex items-center gap-4">
                <AriaVoiceWave isSpeaking={true} />
                <span className="text-cyan-400 font-mono text-sm uppercase tracking-widest animate-pulse">Processing...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <Slide direction="up" distance={50} className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-black/90 backdrop-blur-xl z-20">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Command ARIA..."
            className="flex-1 bg-[var(--color-system-dark)] border border-gray-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500 font-sans transition-colors"
            disabled={chatMutation.isPending}
          />
          <button
            type="button"
            className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-800 text-gray-400 hover:text-cyan-400 transition-colors border border-gray-700"
          >
            <Mic className="w-5 h-5" />
          </button>
          <PrimaryButton 
            type="submit" 
            disabled={!input.trim() || chatMutation.isPending}
            className="w-14 h-14 !p-0 flex items-center justify-center rounded-xl"
          >
            <Send className="w-5 h-5" />
          </PrimaryButton>
        </form>
      </Slide>
    </Fade>
  );
};
