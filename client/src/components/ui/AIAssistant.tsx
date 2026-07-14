import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Terminal } from 'lucide-react';
import { AriaCore } from '../aria/AriaCore';
import { fetchWithAuth } from '../../api/fetchHelper';
import { HUDCard } from './HUDCard';
import { useSystemSound } from '../../hooks/useSystemSound';
import { useLocation, useNavigate } from 'react-router-dom';

export const AIAssistant: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(location.pathname === '/assistant');
  const [messages, setMessages] = useState<{ role: 'user' | 'system', content: string }[]>([
    { role: 'system', content: 'SYSTEM IGGRIS ONLINE. AWAITING YOUR ORDERS, COMMANDER.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { play } = useSystemSound();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      play('hover');
    }
  }, [messages, isOpen, play]);

  useEffect(() => {
    if (location.pathname === '/assistant') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [location.pathname]);

  const handleClose = () => {
    setIsOpen(false);
    play('hover');
    if (location.pathname === '/assistant') {
      navigate('/');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    play('click');
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetchWithAuth('/api/assistant/chat', { 
        method: 'POST', 
        body: JSON.stringify({ message: userMessage }) 
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'system', content: data.reply }]);
      play('alert');
    } catch {
      setMessages(prev => [...prev, { role: 'system', content: 'ERROR: CONNECTION TO SYSTEM NETWORK FAILED.' }]);
      play('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-[var(--color-system-blue)] text-black rounded-none clip-edges shadow-glow-blue flex items-center justify-center z-50 hover:bg-white transition-colors"
            onClick={() => navigate('/assistant')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AriaCore size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 md:bottom-24 md:right-6 w-[calc(100vw-32px)] sm:w-96 h-[550px] max-h-[70vh] z-50 flex flex-col pointer-events-auto"
          >
            <HUDCard 
              variant="default" 
              className="flex-1 flex flex-col h-full shadow-2xl" 
              innerClassName="p-0 flex flex-col h-full overflow-hidden"
              title="SYSTEM // IGGRIS"
              headerAction={
                <button onClick={handleClose} className="text-[var(--color-system-text-dim)] hover:text-white transition-colors">
                  <X size={18} />
                </button>
              }
            >
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono scrollbar-hide bg-black/40">
                {messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 text-xs md:text-sm tracking-wide ${
                      msg.role === 'user' 
                        ? 'bg-[var(--color-system-blue)]/20 text-white border border-[var(--color-system-blue)]/50 clip-edges' 
                        : 'bg-black/60 text-[var(--color-system-blue)] border border-[var(--color-system-blue)]/20 clip-edges'
                    }`}>
                      {msg.role === 'system' && <Terminal size={12} className="inline mr-2 mb-1" />}
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-black/60 text-[var(--color-system-blue)] border border-[var(--color-system-blue)]/20 clip-edges p-3 text-xs tracking-widest animate-pulse">
                      <Terminal size={12} className="inline mr-2 mb-1" />
                      PROCESSING...
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={sendMessage} className="p-3 border-t border-[rgba(0,229,255,0.2)] bg-[var(--color-system-dark)] flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Query System..."
                  className="flex-1 bg-black/50 border border-[rgba(0,229,255,0.3)] rounded-none px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[var(--color-system-blue)] focus:shadow-glow-blue transition-all"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="bg-[var(--color-system-blue)] text-black p-2.5 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed clip-edges"
                >
                  <Send size={18} />
                </button>
              </form>
            </HUDCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
