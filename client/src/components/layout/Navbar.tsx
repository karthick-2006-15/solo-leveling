import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, User as UserIcon, LayoutDashboard, CheckSquare, Dumbbell, Apple, Code2, Network, Trophy, Activity } from 'lucide-react';
import { AriaCore } from '../aria/AriaCore';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'GET' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPurple">
              SLLS Phase 0
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/" className="text-textMuted hover:text-neonBlue transition-colors" title="Dashboard">
              <LayoutDashboard size={20} />
            </Link>
            <Link to="/habits" className="text-textMuted hover:text-neonBlue transition-colors" title="Habits">
              <CheckSquare size={20} />
            </Link>
            <Link to="/workouts" className="text-textMuted hover:text-neonBlue transition-colors" title="Workouts">
              <Dumbbell size={20} />
            </Link>
            <Link to="/nutrition" className="text-textMuted hover:text-green-400 transition-colors" title="Nutrition">
              <Apple size={20} />
            </Link>
            <Link to="/skills" className="text-textMuted hover:text-blue-400 transition-colors" title="Skills">
              <Network size={20} />
            </Link>
            <Link to="/dsa" className="text-textMuted hover:text-purple-400 transition-colors" title="DSA Tracker">
              <Code2 size={20} />
            </Link>
            <Link to="/achievements" className="text-textMuted hover:text-yellow-400 transition-colors" title="Achievements">
              <Trophy size={20} />
            </Link>
            <Link to="/analytics" className="text-textMuted hover:text-neonBlue transition-colors" title="Analytics">
              <Activity size={20} />
            </Link>
            <Link to="/assistant" className="text-textMuted hover:text-neonPurple transition-colors" title="Iggris Companion">
              <AriaCore size={20} className="hover:scale-110 transition-transform duration-300" />
            </Link>
            <Link to="/profile" className="text-textMuted hover:text-neonPurple transition-colors" title="Profile">
              <UserIcon size={20} />
            </Link>
            <button 
              onClick={handleLogout}
              className="text-textMuted hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
