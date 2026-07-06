import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SystemWindow } from './SystemWindow';

interface SystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'purple' | 'gold' | 'boss';
}

export const SystemModal: React.FC<SystemModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  variant = 'default'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col"
          >
            <SystemWindow title={title} variant={variant} className="w-full flex-1 flex flex-col overflow-hidden" innerClassName="p-0 flex flex-col h-full max-h-[calc(90vh-32px)]">
              <div className="flex justify-between items-center p-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
                <h2 className="font-display font-bold uppercase tracking-widest text-white">{title}</h2>
                <button 
                  onClick={onClose}
                  className="text-[var(--color-system-text-dim)] hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto p-6 custom-scrollbar">
                {children}
              </div>
            </SystemWindow>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
