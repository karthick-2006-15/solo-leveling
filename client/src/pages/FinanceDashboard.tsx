import React from 'react';
import { motion } from 'framer-motion';
import { useFinances } from '../hooks/useFinances';

const FinanceDashboard: React.FC = () => {
  const { profile, isLoading } = useFinances();

  if (isLoading) return <div className="p-6 text-green-400">Loading Financial Intel...</div>;

  return (
    <div className="w-full pb-32">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700 shadow-xl">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-wider">FINANCIAL <span className="text-green-500">INTELLIGENCE</span></h1>
          <p className="text-sm md:text-base text-slate-400">Track your income, budget, and wealth accumulation.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <div className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 font-semibold mb-1 text-sm uppercase">Monthly Income</h3>
            <p className="text-xl md:text-2xl font-bold text-green-400">₹{profile?.monthlyIncome || 0}</p>
          </div>
          <div className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 font-semibold mb-1 text-sm uppercase">Monthly Budget</h3>
            <p className="text-xl md:text-2xl font-bold text-amber-400">₹{profile?.monthlyBudget || 0}</p>
          </div>
          <div className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 font-semibold mb-1 text-sm uppercase">Total Savings</h3>
            <p className="text-xl md:text-2xl font-bold text-blue-400">₹{profile?.currentSavings || 0}</p>
          </div>
          <div className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 font-semibold mb-1 text-sm uppercase">Emergency Fund</h3>
            <p className="text-xl md:text-2xl font-bold text-purple-400 break-words">₹{profile?.emergencyFund || 0} / ₹{profile?.emergencyFundTarget || 0}</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4">Financial Goals</h2>
          {profile?.financialGoals?.length ? (
            <div className="space-y-3 md:space-y-4">
              {profile.financialGoals.map((goal: any, i: number) => {
                const percent = Math.min(100, ((goal.currentAmount / goal.targetAmount) * 100) || 0);
                return (
                  <div key={i} className="bg-slate-900 p-3 md:p-4 rounded border border-slate-700">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-1 md:gap-0 mb-2">
                      <span className="text-white font-medium text-sm md:text-base">{goal.name}</span>
                      <span className="text-green-400 text-sm">₹{goal.currentAmount} / ₹{goal.targetAmount}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-slate-500">No financial goals set. Ask ARIA to generate a financial roadmap.</div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
