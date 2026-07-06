import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal, Mic, Volume2, VolumeX, ShieldAlert, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSystemSound } from '../hooks/useSystemSound';
import { HunterTrainingBackground } from '../components/training/HunterTrainingBackground';

const SYSTEM_INSTRUCTION = `[SYSTEM OVERRIDE]: You are ARIA, the Hunter System AI. You MUST respond in a tactical game system style. 
NEVER write long essays or paragraphs. ALWAYS use short bullet points, checklists, cards, tables, or progress summaries. 
Keep answers maximum 5-8 bullets unless explicitly asked for more. 
CRITICAL: Every response MUST begin with a SYSTEM HEADER (e.g., SYSTEM ANALYSIS, MISSION UPDATE, HUNTER REPORT, COMBAT ANALYSIS, TRAINING REPORT, NUTRITION REPORT, RECOVERY REPORT). Be short, direct, actionable, professional.`;

export const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'system', content: string, timestamp: string }[]>([
    { role: 'system', content: 'SYSTEM ANALYSIS\n\nSYSTEM ARIA ONLINE. HOW CAN I ASSIST YOU TODAY, HUNTER?', timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  // Voice Input States
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { play } = useSystemSound();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setInput(currentTranscript);
              // Auto-send when speech is final
              setTimeout(() => {
                const sendBtn = document.getElementById('aria-send-btn');
                if (sendBtn) sendBtn.click();
              }, 300);
            } else {
              setInput(currentTranscript);
            }
          }
        };

        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = () => setIsListening(false);
      }
    }
    
    return () => {
      if (recognitionRef.current && isListening) recognitionRef.current.stop();
      window.speechSynthesis?.cancel();
    };
  }, [isListening]);

  const toggleListen = () => {
    if (isLoading) return;
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        alert("Voice recognition is not supported in this browser.");
        return;
      }
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
      play('click');
    }
  };

  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Clean markdown before speaking
    const cleanText = text.replace(/[*#_`~[\]]/g, '').replace(/SYSTEM ANALYSIS|MISSION UPDATE|HUNTER REPORT/g, 'System Header: $&.');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 0.8; // Lower pitch for calm robotic voice
    
    const voices = window.speechSynthesis.getVoices();
    // Try to find a good robotic or calm voice (often Google UK or similar)
    const preferredVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Microsoft Mark') || v.name.includes('Samantha'));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isListening) {
      recognitionRef.current?.stop();
    }

    play('click');
    const userMessage = input.trim();
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp }]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      // Prompt Injection Strategy
      const payloadMessage = `${SYSTEM_INSTRUCTION}\n\nUser Query: ${userMessage}`;
      
      const response = await fetch('/api/assistant/chat', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: payloadMessage }) 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) throw new Error("No readable stream available");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let systemReply = '';
      const replyTimestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      setMessages(prev => [...prev, { role: 'system', content: '', timestamp: replyTimestamp }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          if (voiceEnabled) speakText(systemReply);
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.content || data.content === '') {
                systemReply += data.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = systemReply;
                  return newMessages;
                });
              } else if (data.error) {
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = 'ERROR: ' + data.error;
                  return newMessages;
                });
                play('error');
              }
            } catch (err) {
              // Ignore partial JSON chunks until they complete
            }
          }
        }
      }
      play('alert');
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'system' && last.content === '') {
           const newMsg = [...prev];
           newMsg[newMsg.length - 1].content = 'ERROR: CONNECTION TO SYSTEM NETWORK FAILED.';
           return newMsg;
        }
        return [...prev, { role: 'system', content: 'ERROR: CONNECTION TO SYSTEM NETWORK FAILED.', timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) }];
      });
      play('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-6rem)] w-full flex flex-col z-0">
      <HunterTrainingBackground />
      
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => {
            setVoiceEnabled(!voiceEnabled);
            if (voiceEnabled) window.speechSynthesis?.cancel();
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded border text-[10px] font-mono tracking-widest uppercase transition-colors ${voiceEnabled ? 'border-cyan-500 text-cyan-400 bg-cyan-950/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'border-gray-700 text-gray-500 bg-black/40'}`}
        >
          {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {voiceEnabled ? 'Voice: ON' : 'Voice: OFF'}
        </button>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col p-4 md:p-6 pb-24 md:pb-6 relative z-10">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-8 custom-scrollbar">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                key={i} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 opacity-60">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-500">
                    {msg.role === 'user' ? 'HUNTER' : 'SYSTEM ARIA'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-cyan-800" />
                  <span className="font-mono text-[9px] text-gray-500">{msg.timestamp}</span>
                </div>
                
                <div className={`relative max-w-[90%] md:max-w-[80%] p-5 text-sm md:text-base tracking-wide rounded-lg backdrop-blur-md ${
                  msg.role === 'user' 
                    ? 'bg-cyan-950/40 text-cyan-50 border border-cyan-800/50 shadow-[0_0_15px_rgba(8,145,178,0.1)]' 
                    : 'bg-black/60 text-cyan-400 border border-cyan-900/50 shadow-[0_0_20px_rgba(0,0,0,0.5)]'
                }`}>
                  {msg.role === 'system' && (
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 opacity-50" />
                  )}
                  
                  {msg.role === 'system' ? (
                    <div className="prose prose-invert prose-cyan max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:text-cyan-300 prose-headings:uppercase prose-headings:tracking-widest prose-li:marker:text-cyan-600 prose-strong:text-white prose-table:border prose-table:border-cyan-900/50 prose-td:border-cyan-900/30 prose-th:bg-cyan-950/50 prose-th:text-cyan-300 font-mono text-[13px]">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                      {/* Blinking Cursor if it's the last system message and we are loading */}
                      {isLoading && i === messages.length - 1 && (
                        <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse align-middle" />
                      )}
                    </div>
                  ) : (
                    <div className="font-mono text-[14px]">{msg.content}</div>
                  )}
                  
                  {msg.role === 'system' && (
                    <div className="absolute bottom-2 right-3 flex items-center gap-1 opacity-30">
                      <ShieldAlert className="w-3 h-3" />
                      <span className="font-mono text-[8px] uppercase tracking-[0.2em]">VERIFIED</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Panel */}
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: 'Workout Plan', prompt: 'Generate a new workout recommendation for today based on my level.' },
            { label: 'Meal Plan', prompt: 'Provide a nutrition recommendation and meal planner for today.' },
            { label: 'Study Planner', prompt: 'Create a study planner for my current active skills.' },
            { label: 'Habit Analysis', prompt: 'Analyze my habits and suggest improvements.' },
            { label: 'Daily Schedule', prompt: 'Create an optimal daily schedule combining my missions, workouts, and study.' },
            { label: 'Memory Review', prompt: 'Recall what I told you previously and summarize my progress.' }
          ].map(action => (
            <button 
              key={action.label}
              onClick={() => {
                setInput(action.prompt);
                setTimeout(() => document.getElementById('aria-send-btn')?.click(), 100);
              }}
              disabled={isLoading}
              className="px-3 py-2 bg-cyan-950/30 border border-cyan-900/50 hover:bg-cyan-900/60 hover:border-cyan-400 rounded text-[9px] font-mono uppercase tracking-widest text-cyan-300 transition-colors disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Tactical Input HUD */}
        <div className="mt-2 bg-black/80 border border-cyan-900/50 rounded-xl p-3 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] relative">
          
          {/* Top Scanner Line */}
          {isListening && (
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500 shadow-[0_0_10px_#00d4ff] animate-[scan_2s_ease-in-out_infinite_alternate]" />
          )}

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleListen}
              disabled={isLoading}
              className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${
                isListening 
                  ? 'bg-cyan-900 border-cyan-400 shadow-[0_0_20px_#00d4ff]' 
                  : 'bg-black/60 border-cyan-800 hover:border-cyan-500 hover:bg-cyan-950/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening && (
                <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-50" />
              )}
              <Mic className={`w-5 h-5 ${isListening ? 'text-white animate-pulse' : 'text-cyan-500'}`} />
            </button>

            <form onSubmit={sendMessage} className="flex-1 flex items-center relative bg-cyan-950/20 border border-cyan-900/40 rounded-lg overflow-hidden">
              <div className="pl-3 opacity-50"><Terminal className="w-4 h-4 text-cyan-500" /></div>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading}
                placeholder={isListening ? "Listening..." : "INPUT COMMAND QUERY..."}
                className="flex-1 bg-transparent px-3 py-4 text-cyan-50 font-mono text-sm focus:outline-none placeholder-cyan-900/50 uppercase tracking-wider"
              />
              
              {/* Waveform while listening */}
              {isListening && (
                <div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  {[1,2,3,4].map(idx => (
                    <div key={idx} className="w-0.5 bg-cyan-400 animate-[bounce_1s_infinite]" style={{ height: `${Math.random() * 12 + 4}px`, animationDelay: `${idx * 0.1}s` }} />
                  ))}
                </div>
              )}

              <button 
                id="aria-send-btn"
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="px-6 py-4 bg-cyan-900/50 text-cyan-400 hover:bg-cyan-800 hover:text-white transition-colors border-l border-cyan-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-mono text-[10px] uppercase tracking-widest font-bold"
              >
                {isLoading ? <Cpu className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
