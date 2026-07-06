import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Plus } from 'lucide-react';
import { HUDCard } from './HUDCard';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  icon = <AlertCircle className="w-12 h-12 text-[var(--color-system-text-dim)]" />
}) => {
  return (
    <HUDCard variant="default" glowOnHover={false} className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <motion.div 
        className="mb-4 text-[var(--color-system-blue)] opacity-50"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon}
      </motion.div>
      <h3 className="font-display text-lg font-bold text-[var(--color-system-text)] mb-2 uppercase tracking-widest">{title}</h3>
      <p className="font-mono text-xs text-[var(--color-system-text-dim)] max-w-sm mb-6">{message}</p>
      
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-2 bg-[var(--color-system-blue)]/10 border border-[var(--color-system-blue)]/30 text-[var(--color-system-blue)] hover:bg-[var(--color-system-blue)] hover:text-black font-display uppercase font-bold tracking-widest transition-colors clip-edges"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </motion.button>
      )}
    </HUDCard>
  );
};
