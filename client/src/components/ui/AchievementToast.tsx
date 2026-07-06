import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastData {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface AchievementToastProps {
  toasts: ToastData[];
  removeToast: (id: string) => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastData, removeToast: (id: string) => void }> = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="pointer-events-auto bg-surface border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)] rounded-lg p-4 w-80 flex items-start gap-4 backdrop-blur-md"
    >
      <div className="text-3xl flex-shrink-0">{toast.icon}</div>
      <div className="flex-grow">
        <h4 className="text-yellow-500 font-bold text-sm tracking-wide uppercase mb-1">Achievement Unlocked</h4>
        <p className="text-white font-semibold">{toast.title}</p>
        <p className="text-textMuted text-xs">{toast.description}</p>
      </div>
    </motion.div>
  );
};
