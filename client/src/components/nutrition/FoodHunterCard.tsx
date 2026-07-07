import React, { useState } from 'react';
import { AlertTriangle, Crosshair, Zap, Star } from 'lucide-react';
import type { AnalyzedFood } from '../../types/nutrition';

interface FoodHunterCardProps {
  food: AnalyzedFood;
  onConfirm: () => void;
  onReject?: () => void;
  onReScan: (alternative: string) => void;
}

const MacroStat = ({ label, value, unit = 'g', color = 'cyan' }: { label: string, value: number, unit?: string, color?: 'cyan' | 'blue' | 'indigo' | 'sky' }) => {
  const colorMap = {
    cyan: 'from-cyan-900/40 to-cyan-800/20 border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400',
    blue: 'from-blue-900/40 to-blue-800/20 border-blue-500/30 text-blue-400 group-hover:border-blue-400',
    indigo: 'from-indigo-900/40 to-indigo-800/20 border-indigo-500/30 text-indigo-400 group-hover:border-indigo-400',
    sky: 'from-sky-900/40 to-sky-800/20 border-sky-500/30 text-sky-400 group-hover:border-sky-400'
  };

  return (
    <div className={`flex flex-col bg-gradient-to-b ${colorMap[color]} border p-3 rounded-lg relative group overflow-hidden transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <span className="text-[10px] font-mono uppercase tracking-widest opacity-80">{label}</span>
      <span className="font-display font-bold text-xl text-white mt-1">{value}<span className="text-[11px] opacity-70 ml-1">{unit}</span></span>
    </div>
  );
};

export const FoodHunterCard: React.FC<FoodHunterCardProps> = ({ food, onConfirm, onReject, onReScan }) => {
  const isConfident = food.confidence >= 70;
  const [xpPopup, setXpPopup] = useState(false);

  const handleAccept = () => {
    setXpPopup(true);
    setTimeout(() => {
      onConfirm();
    }, 800);
  };

  // Ambiguous State
  if (!isConfident && food.alternatives && food.alternatives.length > 0) {
    return (
      <div className="w-full max-w-lg mx-auto bg-black/80 border border-yellow-900/60 rounded-xl p-6 mb-4 relative overflow-hidden backdrop-blur-md shadow-[inset_0_0_30px_rgba(202,138,4,0.15)]">
        <div className="flex items-center gap-3 mb-6 border-b border-yellow-900/50 pb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-500 animate-pulse" />
          <div>
            <h3 className="font-display text-xl text-yellow-500 tracking-[0.2em] uppercase">Signature Ambiguous</h3>
            <p className="font-mono text-[11px] text-yellow-500/70 uppercase tracking-widest mt-1">Multiple matches detected for "{food.foodName}"</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {food.alternatives.map((alt, i) => (
            <button 
              key={i}
              onClick={() => onReScan(`${food.quantity} ${food.unit} ${alt}`)}
              className="flex items-center justify-between p-4 bg-yellow-950/20 border border-yellow-700/30 hover:border-yellow-400 rounded-lg transition-all duration-300 group hover:shadow-[0_0_20px_rgba(202,138,4,0.3)] hover:-translate-y-1 active:scale-95"
            >
              <span className="font-mono text-[14px] text-yellow-100 uppercase tracking-wider">{alt}</span>
              <Crosshair className="w-5 h-5 text-yellow-600 group-hover:text-yellow-400 group-hover:animate-[spin_3s_linear_infinite]" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Confident State (Reward Panel)
  return (
    <div className="w-full max-w-lg mx-auto bg-black/90 border border-cyan-800 rounded-xl p-6 md:p-8 mb-6 relative overflow-hidden backdrop-blur-xl group hover:border-cyan-400 transition-colors duration-500 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent opacity-50 pointer-events-none" />
      
      {/* Header: TARGET LOCKED */}
      <div className="flex flex-col items-center justify-center mb-6 relative z-10 border-b border-cyan-900/50 pb-6">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-cyan-400 text-cyan-400 drop-shadow-[0_0_5px_#22d3ee]" />
          ))}
        </div>
        <h2 className="font-display text-2xl md:text-3xl text-cyan-300 uppercase tracking-[0.3em] mb-1 drop-shadow-[0_0_10px_#22d3ee]">
          Target Locked
        </h2>
        <span className="text-[11px] text-cyan-500 font-mono uppercase tracking-[0.2em] bg-cyan-950/50 px-3 py-1 rounded-full border border-cyan-800/50">
          Match Confidence: {food.confidence}%
        </span>
      </div>

      {/* Main Info */}
      <div className="flex flex-col items-center justify-center mb-8 relative z-10">
        <h3 className="font-display font-bold text-3xl text-white uppercase tracking-wider text-center leading-tight mb-2">
          {food.foodName}
        </h3>
        <p className="text-[12px] font-mono text-cyan-500/80 uppercase tracking-[0.2em]">
          QTY: {food.quantity} {food.unit} <span className="mx-2 opacity-50">|</span> WEIGHT: {food.estimatedWeightGrams}G
        </p>
      </div>
      
      {/* Massive Calories */}
      <div className="flex flex-col items-center justify-center mb-8 relative z-10">
        <div className="text-7xl font-display font-bold text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] relative">
          {food.calories}
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[14px] font-mono text-cyan-400 uppercase tracking-[0.3em] opacity-80">
            KCAL
          </span>
        </div>
      </div>

      {/* Glowing Macro Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 relative z-10">
        <MacroStat label="Protein" value={food.protein} color="cyan" />
        <MacroStat label="Carbs" value={food.carbs} color="sky" />
        <MacroStat label="Fat" value={food.fat} color="blue" />
        <MacroStat label="Fiber" value={food.fiber} color="indigo" />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 relative z-10">
        <div className="relative">
          {xpPopup && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 font-display text-2xl text-yellow-400 font-bold tracking-widest uppercase drop-shadow-[0_0_15px_#facc15] animate-[bounce-up_0.8s_ease-out_forwards] pointer-events-none z-50">
              +25 XP
            </div>
          )}
          <button 
            onClick={handleAccept}
            className="w-full group/btn relative py-4 bg-cyan-950/80 border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black rounded-lg text-[16px] font-display uppercase tracking-[0.2em] font-bold transition-all duration-300 overflow-hidden flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] active:scale-95"
          >
            <div className="absolute inset-0 bg-white/30 skew-x-[-20deg] translate-x-[-200%] group-hover/btn:animate-[shimmer_1s_infinite]" />
            <Zap className="w-5 h-5 fill-current" />
            <span>Accept Target</span>
          </button>
        </div>

        {onReject && (
          <button 
            onClick={onReject}
            className="w-full py-3 text-[12px] font-mono text-gray-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 uppercase tracking-[0.2em] transition-all rounded-lg active:scale-95"
          >
            Discard Target
          </button>
        )}
      </div>
      
      <div className="text-center mt-6 relative z-10">
        <span className="text-[9px] font-mono text-cyan-800 uppercase tracking-widest">
          SOURCE: {food.source}
        </span>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
        @keyframes bounce-up {
          0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-50%, -20px) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -40px) scale(1); }
        }
      `}} />
    </div>
  );
};
