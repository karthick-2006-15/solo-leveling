import React from 'react';
import { motion } from 'framer-motion';

export const AriaVoiceWave: React.FC<{ isSpeaking: boolean }> = ({ isSpeaking }) => {
  const bars = Array.from({ length: 5 });

  return (
    <div className="flex items-center gap-1 h-8">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,212,255,0.8)]"
          initial={{ height: 4 }}
          animate={{
            // eslint-disable-next-line react-hooks/purity
            height: isSpeaking ? [4, 16 + Math.random() * 16, 4] : 4
          }}
          transition={{
            duration: isSpeaking ? 0.4 + (i * 0.1) : 0.3,
            repeat: isSpeaking ? Infinity : 0,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};
