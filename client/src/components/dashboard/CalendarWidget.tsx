import React from 'react';
import { SystemWindow } from '../ui/SystemWindow';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

export const CalendarWidget: React.FC = () => {
  const today = new Date();
  const startDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  return (
    <SystemWindow title="Temporal Cycle" innerClassName="p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="font-display font-bold text-[14px] text-white uppercase tracking-wider">{format(today, 'MMMM yyyy')}</span>
        <span className="font-mono text-[10px] text-[var(--color-system-text-dim)] tracking-widest uppercase">Cycle {format(today, 'ww')}</span>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div 
              key={i} 
              className={`flex flex-col items-center justify-center p-2 rounded-[2px] border ${
                isToday 
                  ? 'bg-[rgba(0,212,255,0.1)] border-[var(--color-system-blue)] text-[var(--color-system-blue)]' 
                  : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] text-[var(--color-system-text-dim)]'
              }`}
            >
              <span className="font-mono text-[9px] uppercase tracking-widest mb-1">{format(day, 'EEE')}</span>
              <span className={`font-mono font-bold text-[14px] ${isToday ? 'text-white' : ''}`}>{format(day, 'd')}</span>
            </div>
          );
        })}
      </div>
    </SystemWindow>
  );
};
