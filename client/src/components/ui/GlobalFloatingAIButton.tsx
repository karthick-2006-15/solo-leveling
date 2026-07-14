import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AriaCore } from '../aria/AriaCore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSystemSound } from '../../hooks/useSystemSound';
import { useAuthStore } from '../../store/useAuthStore';

export const GlobalFloatingAIButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { play } = useSystemSound();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated || location.pathname === '/assistant') return null;

  const handleClick = () => {
    play('click');
    setIsClicked(true);
    // Smooth transition delay
    setTimeout(() => {
      navigate('/assistant');
      setIsClicked(false);
    }, 400);
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed bottom-24 right-4 md:bottom-6 md:right-6 w-16 h-16 min-h-[64px] min-w-[64px] rounded-full flex items-center justify-center z-[100] bg-transparent outline-none focus:outline-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence>
        {isClicked && (
          <motion.div
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-2 border-cyan-400 z-0 pointer-events-none"
            style={{ boxShadow: '0 0 20px 5px rgba(0,229,255,0.5)' }}
          />
        )}
      </AnimatePresence>
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <AriaCore size={64} isHovered={isHovered} />
      </div>
    </motion.button>
  );
};
