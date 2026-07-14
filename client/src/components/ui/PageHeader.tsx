import React from 'react';
import { motion } from 'framer-motion';
import { useMonarch } from '../../hooks/useMonarch';
import { Shield, Skull } from 'lucide-react';

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
  const { monarchData } = useMonarch();
  const attributes = monarchData?.monarch?.attributes;

  return (
    <motion.div 
      className="w-full mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] md:text-[12px] text-cyan-500 tracking-[0.15em] uppercase flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 animate-pulse" />
            // SYSTEM LOG / {breadcrumb || title}
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white uppercase tracking-[0.1em] leading-none mt-2 text-shadow-glow">
            {title}
          </h1>
          {subtitle && (
            <p className="font-mono text-[12px] text-cyan-300/70 mt-3 tracking-widest uppercase overflow-hidden">
              <span className="inline-block animate-scan-text">
                &gt; {subtitle}
              </span>
            </p>
          )}
        </div>
        
        {action && (
          <div className="ml-4 shrink-0">
            {action}
          </div>
        )}
        
        {!action && attributes && (
          <div className="ml-auto flex gap-6 shrink-0 pb-1">
            {/* Willpower Bar */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-mono tracking-widest uppercase">
                <Shield size={10} /> Willpower
              </div>
              <div className="w-24 h-1.5 bg-black/50 border border-indigo-900/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-1000"
                  style={{ width: `${attributes.willpower}%` }}
                />
              </div>
            </div>

            {/* Corruption Bar */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-mono tracking-widest uppercase">
                <Skull size={10} /> Corruption
              </div>
              <div className="w-24 h-1.5 bg-black/50 border border-red-900/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)] transition-all duration-1000"
                  style={{ width: `${attributes.corruption}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Bottom Border */}
      <div className="relative w-full h-[2px] bg-cyan-900/30 mt-4">
        {/* Neon Accent Line */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-transparent"
        />
        <div className="absolute top-0 left-[20%] w-32 h-[2px] bg-white shadow-[0_0_15px_#00e5ff] animate-scan" />
        <div className="absolute -left-1 -top-1 w-2 h-2 border border-cyan-400 bg-black" />
        <div className="absolute -right-1 -top-1 w-2 h-2 border border-cyan-400 bg-black" />
      </div>
    </motion.div>
  );
};
