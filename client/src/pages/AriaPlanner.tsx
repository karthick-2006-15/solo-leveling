import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAriaReports } from '../hooks/useAria';

const AriaPlanner: React.FC = () => {
  const { plans, isLoadingPlans, createPlan } = useAriaReports();
  const [goal, setGoal] = useState('');
  const [planType, setPlanType] = useState('WEEKLY');

  const handleGeneratePlan = async () => {
    if (!goal) return;
    await createPlan.mutateAsync({ type: planType, goal });
    setGoal('');
  };

  return (
    <div className="w-full pb-32">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wider">IGGRIS <span className="text-blue-500">PLANNER</span></h1>
          <p className="text-slate-400">Generate intelligent, adaptive roadmaps powered by your Hunter context.</p>
        </motion.div>

        <div className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700 flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center">
          <select 
            value={planType} 
            onChange={(e) => setPlanType(e.target.value)}
            className="bg-slate-900 border border-slate-600 text-white p-3 rounded text-base md:text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="DAILY">Daily Plan</option>
            <option value="WEEKLY">Weekly Roadmap</option>
            <option value="MONTHLY">Monthly Goals</option>
            <option value="SEMESTER">Semester Strategy</option>
            <option value="CAREER">Career Roadmap</option>
            <option value="TRANSFORMATION">Transformation Plan</option>
          </select>
          
          <input 
            type="text" 
            value={goal} 
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Master React and get a frontend internship..." 
            className="flex-1 bg-slate-900 border border-slate-600 p-3 rounded text-white text-base md:text-sm focus:border-blue-500 focus:outline-none"
          />
          
          <button 
            onClick={handleGeneratePlan}
            disabled={createPlan.isPending || !goal}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded font-bold transition-colors disabled:opacity-50 w-full sm:w-auto min-h-[44px]"
          >
            {createPlan.isPending ? 'Synthesizing...' : 'Generate Plan'}
          </button>
        </div>

        {isLoadingPlans ? (
          <div className="text-blue-400">Loading Active Plans...</div>
        ) : (
          <div className="grid gap-6 grid-cols-1">
            {plans?.map((plan: any) => (
              <motion.div key={plan._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                  <span className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-xs font-bold border border-blue-800">
                    {plan.type}
                  </span>
                </div>
                <div className="space-y-3">
                  {plan.milestones.map((ms: any, i: number) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded border ${ms.completed ? 'bg-slate-900/50 border-slate-700 opacity-60' : 'bg-slate-900 border-blue-900/30'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${ms.completed ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`} />
                      <div>
                        <div className={`font-bold ${ms.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{ms.title}</div>
                        {ms.description && <div className="text-slate-400 text-sm mt-1">{ms.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
            
            {plans?.length === 0 && (
              <div className="text-slate-500 text-center py-12">No active plans. Generate one above.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AriaPlanner;
