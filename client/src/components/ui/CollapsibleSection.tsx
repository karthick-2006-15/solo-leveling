import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { HUDCard } from './HUDCard';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'danger' | 'success' | 'cyber';
  badge?: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = true,
  children,
  variant = 'default',
  badge
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <HUDCard variant={variant} className="w-full" innerClassName="p-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 cursor-pointer focus:outline-none bg-black/20 hover:bg-black/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className={`font-display font-bold uppercase tracking-widest text-sm ${
            variant === 'gold' ? 'text-[var(--color-system-gold)]' : 
            variant === 'danger' ? 'text-[var(--color-system-red)]' : 
            variant === 'cyber' ? 'text-[var(--color-system-purple)]' : 
            'text-[var(--color-system-blue)]'
          }`}>
            {title}
          </h3>
          {badge && <div>{badge}</div>}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 opacity-70" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-[rgba(0,229,255,0.1)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </HUDCard>
  );
};
