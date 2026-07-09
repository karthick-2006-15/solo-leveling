import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useSystemSound } from '../../hooks/useSystemSound';
import { haptics } from '../../utils/haptics';
import { LayoutDashboard, Target, Activity, User as UserIcon, Heart, Crown, Box, Castle as DungeonIcon, BookOpen } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const { play } = useSystemSound();

  if (!user) return null;

  const tabs = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Vitals', path: '/vitals', icon: Heart },
    { name: 'Track', path: '/habits', icon: Activity },
    { name: 'Monarch', path: '/monarch', icon: Crown },
    { name: 'Quests', path: '/achievements', icon: Target },
    { name: 'Gates', path: '/dungeons', icon: DungeonIcon },
    { name: 'Lore', path: '/story', icon: BookOpen },
    { name: 'Inventory', path: '/inventory', icon: Box },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-system-dark)] border-t border-[var(--color-system-border)] md:top-0 md:bottom-auto md:border-t-0 md:border-b safe-area-bottom">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          
          {/* Desktop Logo (hidden on mobile) */}
          <div className="hidden md:flex items-center mr-8">
            <Link to="/" className="font-display text-xl font-bold uppercase tracking-widest text-[var(--color-system-blue)] drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
              SOLO LEVELING
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex justify-around items-center w-full md:w-auto md:gap-8 relative h-full">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path || 
                (tab.name === 'Track' && ['/workouts', '/nutrition', '/skills', '/dsa'].includes(location.pathname));

              const Icon = tab.icon;

              return (
                <Link 
                  key={tab.name} 
                  to={tab.path} 
                  onClick={() => {
                    play('click');
                    haptics.lightTap();
                  }}
                  className={`relative flex flex-col items-center justify-center w-full h-full md:w-auto md:px-4 transition-colors duration-200 z-10 ${
                    isActive ? 'text-[var(--color-system-blue)]' : 'text-[var(--color-system-text-dim)] hover:text-white'
                  }`}
                >
                  <Icon size={isActive ? 22 : 20} className="mb-1 md:mb-0 md:mr-2" />
                  <span className={`text-[10px] font-display uppercase tracking-wider font-bold md:hidden ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {tab.name}
                  </span>
                  <span className="hidden md:block text-[12px] font-display uppercase tracking-widest font-bold">
                    {tab.name}
                  </span>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute bottom-0 left-[20%] right-[20%] h-[3px] bg-[var(--color-system-blue)] rounded-t-[3px] md:bottom-[-1px] md:left-0 md:right-0 md:h-[2px]"
                      style={{ boxShadow: '0 -2px 10px var(--color-system-blue)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
