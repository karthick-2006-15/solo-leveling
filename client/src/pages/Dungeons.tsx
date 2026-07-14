import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { useDungeons, useBosses } from '../hooks/useDungeons';
import { DungeonPortalModal } from '../components/dungeon/DungeonPortalModal';
import { BossBattleArena } from '../components/dungeon/BossBattleArena';
import { DungeonHistory } from '../components/dungeon/DungeonHistory';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { Castle as DungeonIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dungeons: React.FC = () => {
  const { dungeons, isLoading: isLoadingDungeons, generateDailyDungeon } = useDungeons();
  const { bosses, isLoading: isLoadingBosses } = useBosses();
  const [selectedGate, setSelectedGate] = useState<any>(null);

  const handleGenerate = () => {
    generateDailyDungeon.mutate();
  };

  if (isLoadingDungeons || isLoadingBosses) {
    return <div className="p-6 text-cyan-400 font-mono animate-pulse">Scanning for Gates...</div>;
  }

  const hasActiveDungeon = dungeons && dungeons.length > 0;
  const activeDungeon = hasActiveDungeon ? dungeons[0] : null;

  return (
    <div className="flex flex-col h-full bg-black">
      <PageHeader
        title="Dungeons & Gates"
        subtitle="Face the physical manifestations of your obstacles."
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        {!hasActiveDungeon ? (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 text-center">
            <div className="w-32 h-32 mb-8 relative flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-ping" />
              <DungeonIcon className="w-12 h-12 text-cyan-500/50" />
            </div>
            <h2 className="text-xl md:text-2xl font-display uppercase tracking-widest text-gray-300 mb-4">No Active Gates Detected</h2>
            <p className="text-gray-500 font-mono text-sm mb-8">
              The system scans for anomalies. You can force open a daily gate to face your current challenges.
            </p>
            <PrimaryButton onClick={handleGenerate} disabled={generateDailyDungeon.isPending} className="min-h-[44px]">
              {generateDailyDungeon.isPending ? 'Generating Gate...' : 'Generate Daily Gate'}
            </PrimaryButton>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto flex flex-col gap-4 md:gap-8">
            {/* Active Gate Info */}
            <div className="relative hud-glass corner-brackets p-4 md:p-6 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                  <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest mb-1">Active Operation</h3>
                  <h2 className="text-xl md:text-3xl font-display font-bold uppercase tracking-widest text-white drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
                    {activeDungeon.name}
                  </h2>
                  <p className="text-gray-400 font-mono text-sm mt-2">
                    Difficulty: <span className="text-white">{activeDungeon.difficulty}</span> | Type: {activeDungeon.type}
                  </p>
                </div>
                
                <PrimaryButton 
                  onClick={() => setSelectedGate(activeDungeon)}
                  className="animate-pulse shadow-[0_0_20px_rgba(0,212,255,0.3)] min-h-[44px] w-full md:w-auto"
                >
                  Enter Gate
                </PrimaryButton>
              </div>
            </div>

            {/* Boss Arenas */}
            {bosses && bosses.length > 0 && (
              <div className="space-y-6">
                {bosses.map((boss: any) => (
                  <motion.div
                    key={boss._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <BossBattleArena boss={boss} dungeon={activeDungeon} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="max-w-5xl mx-auto mt-8">
          <DungeonHistory />
        </div>
      </div>

      {selectedGate && (
        <DungeonPortalModal
          isOpen={true}
          dungeonName={selectedGate.name}
          difficulty={selectedGate.difficulty}
          onEnter={() => {
            // Once entered, we could scroll to boss arena or just close the modal.
            // Entering is symbolic, representing committing to the dungeon.
            setSelectedGate(null);
          }}
        />
      )}
    </div>
  );
};
