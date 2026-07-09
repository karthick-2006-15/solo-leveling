import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemSound } from '../../hooks/useSystemSound';
import { haptics } from '../../utils/haptics';

export const SystemBootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  const { play } = useSystemSound();

  useEffect(() => {
    // Stage 0: Initial black screen, power on
    const t1 = setTimeout(() => {
      setStage(1);
      play('boot');
      haptics.heavyTap();
    }, 800);
    
    // Stage 1: Scanning / Boot text
    const t2 = setTimeout(() => {
      setStage(2);
      play('online');
      haptics.success();
    }, 2500);
    
    // Stage 2: Final flash
    const t3 = setTimeout(() => {
      setStage(3);
      setTimeout(onComplete, 800);
    }, 3500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete, play]);

  return (
    <AnimatePresence>
      {stage < 3 && (
        <motion.div 
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center font-mono overflow-hidden"
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Scanline overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-50 opacity-20" />
          
          <div className="relative z-10 w-full max-w-2xl px-6">
            {stage >= 1 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-4 text-[10px] md:text-sm text-cyan-500 uppercase tracking-[0.2em]"
              >
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "100%" }} 
                  transition={{ duration: 1.5, ease: "linear" }}
                  className="overflow-hidden whitespace-nowrap border-r-2 border-cyan-500 pr-2"
                >
                  &gt; INITIALIZING HUNTER SYSTEM...
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.5 }}
                >
                  &gt; LOADING NEURAL INTERFACE... [OK]
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.8 }}
                >
                  &gt; SYNCHRONIZING WITH ARIA AI... [OK]
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 1.1 }}
                >
                  &gt; BYPASSING SECURITY PROTOCOLS... [OK]
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: 1.5, type: 'spring' }}
                  className="text-center mt-12 text-2xl md:text-4xl font-display text-white text-shadow-glow"
                >
                  SYSTEM ONLINE
                </motion.div>
                
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="h-[1px] bg-cyan-500 shadow-[0_0_15px_#00d4ff] mt-4"
                />
              </motion.div>
            )}
          </div>
          
          {/* Final flash */}
          {stage === 2 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 bg-cyan-400 z-50 mix-blend-overlay"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
