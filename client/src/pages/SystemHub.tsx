import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Briefcase, DollarSign, Activity, 
  Target, Castle, Users, BookOpen, 
  BrainCircuit, ShieldCheck, Box, LineChart, Code, User
} from 'lucide-react';
import clsx from 'clsx';

export const SystemHub: React.FC = () => {
  const modules = [
    { name: 'Academics', path: '/academics', icon: GraduationCap, color: 'text-blue-400', desc: 'University & Course tracking' },
    { name: 'Career', path: '/career', icon: Briefcase, color: 'text-amber-400', desc: 'Job applications & networking' },
    { name: 'Finance', path: '/finance', icon: DollarSign, color: 'text-emerald-400', desc: 'Budget & expense management' },
    { name: 'Economy', path: '/economy', icon: DollarSign, color: 'text-yellow-400', desc: 'Hunter Coin transactions' },
    { name: 'Analytics', path: '/analytics', icon: LineChart, color: 'text-cyan-400', desc: 'Advanced performance metrics' },
    { name: 'DSA Training', path: '/dsa', icon: Code, color: 'text-orange-400', desc: 'Algorithms & data structures' },
    { name: 'Aria Planner', path: '/aria-planner', icon: BrainCircuit, color: 'text-purple-400', desc: 'AI-assisted schedule generation' },
    { name: 'Shadow Army', path: '/shadows', icon: Users, color: 'text-indigo-400', desc: 'Manage your defeated bosses' },
    { name: 'Hunter Museum', path: '/museum', icon: Castle, color: 'text-rose-400', desc: 'View past relics and achievements' },
    { name: 'Quests', path: '/achievements', icon: Target, color: 'text-red-400', desc: 'View active quests' },
    { name: 'Lore & Story', path: '/story', icon: BookOpen, color: 'text-teal-400', desc: 'Unlock the Solo Leveling narrative' },
    { name: 'Inventory & Shop', path: '/inventory', icon: Box, color: 'text-slate-400', desc: 'Manage assets and purchases' },
    { name: 'Guardian', path: '/guardian', icon: ShieldCheck, color: 'text-cyan-500', desc: 'Recovery & Relapse prevention' },
    { name: 'Vitals & Health', path: '/vitals', icon: Activity, color: 'text-green-500', desc: 'Track physical health metrics' },
    { name: 'Status', path: '/status', icon: User, color: 'text-blue-300', desc: 'Hunter level, rank & attributes' },
  ];

  return (
    <div className="relative min-h-screen text-white font-mono pb-24 md:pb-8">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 relative z-10">
        <PageHeader 
          title="System Hub" 
          subtitle="Access all initialized system modules and sub-systems." 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
          {modules.map((mod, i) => (
            <Link 
              key={mod.name} 
              to={mod.path}
              className="group relative hud-glass p-5 rounded-xl border border-cyan-900/30 hover:border-cyan-400/50 hover:bg-cyan-950/40 transition-all flex flex-col items-center text-center overflow-hidden"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 blur-xl transition-all" />
              
              <div className={clsx("w-14 h-14 rounded-full flex items-center justify-center bg-black/50 border border-white/5 mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,0,0,0.5)]", mod.color)}>
                <mod.icon size={28} />
              </div>

              <h3 className="font-display uppercase tracking-widest text-sm text-cyan-50 group-hover:text-white mb-2">
                {mod.name}
              </h3>
              
              <p className="text-xs text-gray-500 group-hover:text-cyan-200 transition-colors">
                {mod.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
