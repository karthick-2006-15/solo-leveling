import React from 'react';
import { SystemWindow } from './SystemWindow';
import { QuestItem } from './QuestItem';
import type { QuestInstance } from '../../api/missionApi';

interface Props {
  quests: QuestInstance[];
}

export const DailyMissionsWidget: React.FC<Props> = ({ quests }) => {
  const completedCount = quests.filter(q => q.completed).length;
  const allCompleted = quests.length > 0 && completedCount === quests.length;

  return (
    <SystemWindow title="DAILY QUESTS" className="h-full">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <span className="font-mono text-[11px] text-[var(--color-system-text-dim)] uppercase tracking-wider">
            Active Missions
          </span>
          <span className="font-mono text-[11px] text-[var(--color-system-blue)]">
            {completedCount} / {quests.length}
          </span>
        </div>
        
        <div className="space-y-1 flex-grow">
          {quests.length === 0 && (
            <div className="text-center py-6 flex flex-col items-center">
              <span className="font-display text-[14px] text-[var(--color-system-text-dim)] uppercase tracking-widest">
                No missions assigned today
              </span>
            </div>
          )}
          
          {quests.map(quest => (
            <QuestItem key={quest._id} quest={quest} />
          ))}
          
          {allCompleted && (
            <div className="mt-4 w-full bg-[rgba(0,255,136,0.1)] border border-[var(--color-system-green)] rounded-[2px] p-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_0%,rgba(0,255,136,0.6)_50%,transparent_100%)] w-[200%] animate-[scan_2s_linear_infinite]" />
              <span className="relative z-10 font-display text-[14px] font-bold text-[var(--color-system-green)] uppercase tracking-[0.2em]">
                ALL MISSIONS COMPLETE // REST, HUNTER
              </span>
            </div>
          )}
        </div>
      </div>
    </SystemWindow>
  );
};
