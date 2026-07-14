import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCareer } from '../hooks/useCareer';

const CareerDashboard: React.FC = () => {
  const { profile, isLoading, updateProfile, isUpdating } = useCareer();
  const [role, setRole] = useState(profile?.jobRole || '');

  if (isLoading) return <div className="p-6 text-blue-400">Loading Career Intel...</div>;

  return (
    <div className="w-full pb-32">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700 shadow-xl">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-wider">CAREER <span className="text-blue-500">INTELLIGENCE</span></h1>
          <p className="text-sm md:text-base text-slate-400">Track your professional journey and interview readiness.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <div className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 font-semibold mb-1 text-sm uppercase">Job Role</h3>
            <p className="text-xl md:text-2xl font-bold text-blue-400">{profile?.jobRole || 'Undecided'}</p>
          </div>
          <div className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 font-semibold mb-1 text-sm uppercase">Resume Status</h3>
            <p className="text-xl md:text-2xl font-bold text-amber-400">{profile?.resumeStatus || 'NEEDS_UPDATE'}</p>
          </div>
          <div className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 font-semibold mb-1 text-sm uppercase">DSA Solved</h3>
            <p className="text-xl md:text-2xl font-bold text-green-400">{profile?.dsaProblemsSolved || 0}</p>
          </div>
          <div className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 font-semibold mb-1 text-sm uppercase">Projects</h3>
            <p className="text-xl md:text-2xl font-bold text-purple-400">{profile?.projectsCompleted || 0}</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4">Career Actions</h2>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input 
              type="text" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              placeholder="Set target job role..." 
              className="bg-slate-900 border border-slate-600 p-3 rounded text-base text-white w-full md:max-w-md focus:border-blue-500 focus:outline-none"
            />
            <button 
              onClick={() => updateProfile({ jobRole: role })}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 min-h-[44px] rounded font-bold transition-colors disabled:opacity-50 w-full md:w-auto"
            >
              Update Target
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CareerDashboard;
