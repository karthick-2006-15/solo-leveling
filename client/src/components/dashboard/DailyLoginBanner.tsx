import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEconomy } from '../../hooks/useEconomy';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Gift, X } from 'lucide-react';

export const DailyLoginBanner: React.FC = () => {
  const { stats, claimDailyLogin } = useEconomy();
  const [isDismissed, setIsDismissed] = useState(false);

  // Derived state
  let isVisible = false;
  if (stats && !isDismissed) {
    const lastLogin = stats.lastLoginDate ? new Date(stats.lastLoginDate) : null;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let claimable = true;
    if (lastLogin) {
      lastLogin.setUTCHours(0, 0, 0, 0);
      if (today.getTime() === lastLogin.getTime()) {
        claimable = false;
      }
    }
    
    isVisible = claimable;
  }

  const handleClaim = async () => {
    try {
      await claimDailyLogin.mutateAsync();
      setIsDismissed(true);
    } catch (err) {
      console.error('Failed to claim daily login', err);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-gradient-to-r from-yellow-900/40 via-yellow-600/30 to-yellow-900/40 border border-yellow-500/50 rounded-lg p-4 shadow-[0_0_20px_rgba(234,179,8,0.2)] mb-6 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="absolute top-2 right-2 cursor-pointer opacity-50 hover:opacity-100" onClick={() => setIsDismissed(true)}>
            <X className="w-4 h-4 text-yellow-500" />
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-yellow-950/50 p-3 rounded-full border border-yellow-700">
              <Gift className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-yellow-400 tracking-widest uppercase">Daily Login Reward</h3>
              <p className="text-xs font-mono text-yellow-100/70">Claim your rewards to maintain your {stats?.currentLoginStreak || 0} day streak!</p>
            </div>
          </div>

          <PrimaryButton onClick={handleClaim} disabled={claimDailyLogin.isPending} className="whitespace-nowrap px-8 py-2">
            {claimDailyLogin.isPending ? 'CLAIMING...' : 'CLAIM REWARD'}
          </PrimaryButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
