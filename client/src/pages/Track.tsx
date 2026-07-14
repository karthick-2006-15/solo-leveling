import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Swords, Apple, Code, ChevronDown, ChevronUp } from 'lucide-react';
import { useSystemSound } from '../hooks/useSystemSound';

import { Habits } from './Habits';
import { Workouts } from './Workouts';
import { Nutrition } from './Nutrition';
import { DSA } from './DSA';
import { PageHeader } from '../components/ui/PageHeader';

interface ModuleConfig {
  id: string;
  title: string;
  icon: React.FC<any>;
  component: React.FC;
  color: string;
}

const MODULES: ModuleConfig[] = [
  { id: 'habit', title: 'Habit Module', icon: CheckSquare, component: Habits, color: 'var(--color-system-green)' },
  { id: 'workout', title: 'Workout Module', icon: Swords, component: Workouts, color: 'var(--color-system-red)' },
  { id: 'nutrition', title: 'Nutrition Module', icon: Apple, component: Nutrition, color: 'var(--color-system-blue)' },
  { id: 'study', title: 'Study Module', icon: Code, component: DSA, color: 'var(--color-system-gold)' },
];

export const Track: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { play } = useSystemSound();

  const moduleQuery = searchParams.get('module') || 'habit';
  const isValidModule = MODULES.some(m => m.id === moduleQuery);
  const activeModuleId = isValidModule ? moduleQuery : 'habit';

  const [isActivating, setIsActivating] = useState<boolean>(true);
  
  const moduleRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!isValidModule) {
      setSearchParams({ module: 'habit' }, { replace: true });
    }
  }, [isValidModule, setSearchParams]);

  useEffect(() => {
    // Trigger system activation overlay
    let overlayTimer: ReturnType<typeof setTimeout>;
    const startActivation = setTimeout(() => {
      setIsActivating(true);
      play('click');
      
      overlayTimer = setTimeout(() => {
        setIsActivating(false);
        
        // Scroll to active module
        setTimeout(() => {
          const activeRef = moduleRefs.current[activeModuleId];
          if (activeRef) {
            activeRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Focus first interactive element
            const focusable = activeRef.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
            if (focusable) {
              focusable.focus({ preventScroll: true });
            }
          }
        }, 100);
      }, 800);
    }, 0);

    return () => {
      clearTimeout(startActivation);
      if (overlayTimer) clearTimeout(overlayTimer);
    };
  }, [activeModuleId, play]);

  const handleToggle = (id: string) => {
    if (activeModuleId !== id) {
      setSearchParams({ module: id });
    }
  };

  const activeConfig = MODULES.find(m => m.id === activeModuleId) || MODULES[0];

  return (
    <div className="relative pb-24 font-sans animate-[fade-in_0.5s_ease-out] min-h-screen">
      
      {/* System Activating Overlay */}
      <AnimatePresence>
        {isActivating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#00050b] flex flex-col items-center justify-center backdrop-blur-md"
          >
            <div 
              className="w-16 h-16 border-4 rounded-full animate-spin mb-4" 
              style={{ borderColor: `${activeConfig.color}33`, borderTopColor: activeConfig.color }}
            />
            <h2 
              className="font-mono text-sm uppercase tracking-[0.3em] animate-pulse"
              style={{ color: activeConfig.color }}
            >
              Loading {activeConfig.title}...
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader 
        title={activeConfig.title}
        subtitle="Universal Tracking Interface" 
      />

      <div className="space-y-3 md:space-y-4 max-w-7xl mx-auto px-3 md:px-4 mt-4 md:mt-6">
        {MODULES.map((mod) => {
          const isActive = activeModuleId === mod.id;
          const Icon = mod.icon;
          
          return (
            <div 
              key={mod.id} 
              ref={(el) => { moduleRefs.current[mod.id] = el; }}
              className={`hud-glass corner-brackets transition-all duration-300 overflow-hidden ${
                isActive 
                  ? '' 
                  : 'bg-black/30 hover:bg-black/40 border-white/5 grayscale opacity-70'
              }`}
              style={{ borderColor: isActive ? mod.color : undefined }}
            >
              {/* Header / Accordion Toggle */}
              <button
                onClick={() => handleToggle(mod.id)}
                className="w-full flex items-center justify-between p-3 md:p-4 min-h-[44px] cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`p-2 rounded transition-colors ${isActive ? 'bg-white/10' : 'bg-transparent'}`}
                    style={{ color: isActive ? mod.color : 'var(--color-system-text-dim)' }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 
                    className="font-display uppercase tracking-widest text-base md:text-lg"
                    style={{ color: isActive ? mod.color : 'var(--color-system-text-dim)' }}
                  >
                    {mod.title}
                  </h3>
                </div>
                <div style={{ color: isActive ? mod.color : 'var(--color-system-text-dim)' }}>
                  {isActive ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {/* Accordion Content */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 md:p-4 pt-0 border-t border-white/5 mt-2">
                      <mod.component />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
