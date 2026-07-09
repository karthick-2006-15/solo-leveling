import React, { useState } from 'react';
import { SystemWindow } from '../ui/SystemWindow';
import { Star, CheckCircle, Circle, Trophy } from 'lucide-react';
import { useEconomy } from '../../hooks/useEconomy';
import { PrimaryButton } from '../ui/PrimaryButton';

interface PerfectDayWidgetProps {
  missionsCompleted: boolean;
  recoveryPassed: boolean;
  hasClaimed: boolean;
}

export const PerfectDayWidget: React.FC<PerfectDayWidgetProps> = ({ missionsCompleted, recoveryPassed, hasClaimed }) => {
  const { claimPerfectDay } = useEconomy();
  const [error, setError] = useState('');

  const isEligible = missionsCompleted && recoveryPassed && !hasClaimed;

  const handleClaim = async () => {
    try {
      setError('');
      await claimPerfectDay.mutateAsync();
    } catch (err: any) {
      setError(err.message || 'Failed to claim');
    }
  };

  return (
    <SystemWindow title={<div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /> Perfect Day Status</div>}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
           {missionsCompleted ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Circle className="w-5 h-5 text-gray-500" />}
           <span className={`text-sm ${missionsCompleted ? 'text-green-100' : 'text-gray-400'}`}>All Daily Missions Completed</span>
        </div>
        <div className="flex items-center gap-3">
           {recoveryPassed ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Circle className="w-5 h-5 text-gray-500" />}
           <span className={`text-sm ${recoveryPassed ? 'text-green-100' : 'text-gray-400'}`}>Recovery Score &gt;= 70</span>
        </div>

        {error && <div className="text-red-400 text-xs text-center">{error}</div>}

        <div className="mt-4 pt-4 border-t border-[var(--color-system-border)]">
          {hasClaimed ? (
            <div className="text-center text-xs text-yellow-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Star className="w-4 h-4" /> Perfect Day Claimed!
            </div>
          ) : (
            <PrimaryButton 
              onClick={handleClaim} 
              disabled={!isEligible || claimPerfectDay.isPending}
              className="w-full text-xs"
            >
              CLAIM PERFECT DAY REWARD
            </PrimaryButton>
          )}
        </div>
      </div>
    </SystemWindow>
  );
};
