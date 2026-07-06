import React, { useEffect, useState } from 'react';
import { SystemWindow } from './SystemWindow';

interface StatTileProps {
  label: string;
  value: string | number;
  subtext?: string;
  accent?: 'blue' | 'purple' | 'gold' | 'green' | 'red';
  valueColor?: 'default' | 'accent';
  delay?: number;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  subtext,
  accent = 'blue',
  valueColor = 'default',
  delay = 0
}) => {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? 0 : value);

  // Counter animation for numbers
  useEffect(() => {
    if (typeof value === 'number') {
      const start = 0;
      const end = value;
      if (start === end) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDisplayValue(end);
        return;
      }
      
      const duration = 1200; // ms
      const startTime = performance.now() + (delay * 1000);

      const updateCounter = (currentTime: number) => {
        if (currentTime < startTime) {
          requestAnimationFrame(updateCounter);
          return;
        }
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeOutQuart
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOut);
        
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          setDisplayValue(end);
        }
      };

      requestAnimationFrame(updateCounter);
    } else {
      setDisplayValue(value);
    }
  }, [value, delay]);

  let accentColor = 'var(--color-system-blue)';
  if (accent === 'purple') accentColor = 'var(--color-system-purple)';
  if (accent === 'gold') accentColor = 'var(--color-system-gold)';
  if (accent === 'green') accentColor = 'var(--color-system-green)';
  if (accent === 'red') accentColor = 'var(--color-system-red)';

  let valColorClass = 'text-[var(--color-system-text)]';
  if (valueColor === 'accent') {
    if (accent === 'blue') valColorClass = 'text-[var(--color-system-blue)]';
    if (accent === 'purple') valColorClass = 'text-[var(--color-system-purple)]';
    if (accent === 'gold') valColorClass = 'text-[var(--color-system-gold)]';
    if (accent === 'green') valColorClass = 'text-[var(--color-system-green)]';
    if (accent === 'red') valColorClass = 'text-[var(--color-system-red)]';
  }

  return (
    <SystemWindow innerClassName="p-0" className="w-full">
      <div className="relative w-full px-4 py-3 flex flex-col justify-between h-full min-h-[90px]">
        {/* Left Border Accent */}
        <div 
          className="absolute left-0 top-3 bottom-3 w-[2px]" 
          style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }} 
        />
        
        <div className="flex flex-col pl-1">
          <span className="font-display text-[10px] tracking-[0.12em] uppercase text-[var(--color-system-text-dim)] font-semibold mb-1">
            {label}
          </span>
          <span className={`font-mono text-[28px] font-semibold leading-none drop-shadow-sm ${valColorClass}`}>
            {displayValue}
          </span>
        </div>
        
        {subtext && (
          <span className="font-body text-[11px] text-[var(--color-system-text-dim)] mt-2 pl-1 truncate">
            {subtext}
          </span>
        )}
      </div>
    </SystemWindow>
  );
};
