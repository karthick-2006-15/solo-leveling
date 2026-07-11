import React from 'react';
import { Link } from 'react-router-dom';
import { SystemWindow } from '../ui/SystemWindow';
import { Swords, CheckSquare, Apple, Code, User, Bot } from 'lucide-react';

export const QuickActionsWidget: React.FC = () => {
  const actions = [
    { icon: <CheckSquare size={16} />, label: "Log Habit", path: "/track?module=habit", color: "text-[var(--color-system-green)]" },
    { icon: <Swords size={16} />, label: "Train", path: "/track?module=workout", color: "text-[var(--color-system-red)]" },
    { icon: <Apple size={16} />, label: "Nutrition", path: "/track?module=nutrition", color: "text-[var(--color-system-blue)]" },
    { icon: <Code size={16} />, label: "Study DSA", path: "/track?module=study", color: "text-[var(--color-system-gold)]" },
    { icon: <Bot size={16} />, label: "ARIA Chat", path: "/aria", color: "text-[var(--color-system-violet)]" },
    { icon: <User size={16} />, label: "Profile", path: "/settings", color: "text-[var(--color-system-text-dim)]" }
  ];

  return (
    <SystemWindow title="Command Links" innerClassName="p-4">
      <div className="grid grid-cols-3 gap-2">
        {actions.map((act, i) => (
          <Link 
            key={i} 
            to={act.path}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[2px] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] transition-all group"
          >
            <div className={`${act.color} group-hover:scale-110 transition-transform`}>
              {act.icon}
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-system-text-dim)] group-hover:text-white transition-colors text-center leading-tight">
              {act.label}
            </span>
          </Link>
        ))}
      </div>
    </SystemWindow>
  );
};
