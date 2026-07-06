import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  action
}) => {
  return (
    <motion.div 
      className="w-full mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] text-[var(--color-system-text-dim)] tracking-[0.08em] uppercase">
            // HUNTER SYSTEM / {breadcrumb || title}
          </span>
          <h1 className="font-display text-[28px] font-bold text-[var(--color-system-text)] uppercase tracking-wider leading-none mt-1">
            {title}
          </h1>
          {subtitle && (
            <p className="font-body text-[14px] text-[var(--color-system-text-dim)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        {action && (
          <div className="ml-4 shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Decorative Bottom Border */}
      <div className="relative w-full h-[1px] bg-[rgba(0,212,255,0.1)]">
        {/* Neon Accent Line */}
        <div 
          className="absolute top-0 left-0 h-full w-[60px] bg-[var(--color-system-blue)]"
          style={{ boxShadow: '0 0 8px var(--color-system-blue)' }}
        />
      </div>
    </motion.div>
  );
};
