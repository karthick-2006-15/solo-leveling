import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSystemSound } from '../../hooks/useSystemSound';

export const GlobalFloatingAIButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { play } = useSystemSound();

  if (location.pathname === '/assistant') return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-[var(--color-system-blue)] text-black rounded-none clip-edges shadow-glow-blue flex items-center justify-center z-[100] hover:bg-white transition-colors"
      onClick={() => {
        play('click');
        navigate('/assistant');
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Bot size={28} />
    </motion.button>
  );
};
