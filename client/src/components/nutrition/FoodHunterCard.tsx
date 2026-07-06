import React from 'react';
import { CheckCircle2, AlertTriangle, Crosshair, Zap } from 'lucide-react';
import type { AnalyzedFood } from '../../types/nutrition';

interface FoodHunterCardProps {
  food: AnalyzedFood;
  onConfirm: () => void;
  onReject?: () => void;
  onReScan: (alternative: string) => void;
}

const MacroStat = ({ label, value, unit = 'g' }: { label: string, value: number, unit?: string }) => (
  <div className="flex flex-col border border-cyan-900/40 bg-black/40 p-2 rounded relative group overflow-hidden">
    <div className="absolute inset-0 bg-cyan-400/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
    <span className="text-[9px] font-mono uppercase text-cyan-600 tracking-widest">{label}</span>
    <span className="font-display font-bold text-lg text-white">{value}<span className="text-[10px] text-cyan-500 ml-0.5">{unit}</span></span>
  </div>
);

export const FoodHunterCard: React.FC<FoodHunterCardProps> = ({ food, onConfirm, onReject, onReScan }) => {
  const isConfident = food.confidence >= 70;

  // Ambiguous State
  if (!isConfident && food.alternatives && food.alternatives.length > 0) {
    return (
      <div className="w-full bg-black/60 border border-yellow-900/60 rounded p-6 mb-4 relative overflow-hidden backdrop-blur-sm shadow-[inset_0_0_20px_rgba(202,138,4,0.1)]">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-yellow-500 animate-pulse" />
          <div>
            <h3 className="font-display text-xl text-yellow-500 tracking-[0.2em] uppercase">Signature Ambiguous</h3>
            <p className="font-mono text-[10px] text-yellow-500/70 uppercase tracking-widest mt-1">Multiple matches detected for "{food.foodName}". Select target.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {food.alternatives.map((alt, i) => (
            <button 
              key={i}
              onClick={() => onReScan(`${food.quantity} ${food.unit} ${alt}`)}
              className="flex items-center justify-between p-4 bg-yellow-950/20 border border-yellow-700/30 hover:border-yellow-400 rounded transition-all group hover:shadow-[0_0_15px_rgba(202,138,4,0.3)] hover:-translate-y-0.5"
            >
              <span className="font-mono text-[13px] text-yellow-100 uppercase tracking-wider">{alt}</span>
              <Crosshair className="w-4 h-4 text-yellow-600 group-hover:text-yellow-400 group-hover:animate-spin" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Confident State
  return (
    <div className="w-full bg-black/80 border border-cyan-800 rounded p-6 mb-4 relative overflow-hidden backdrop-blur-md group hover:border-cyan-400 transition-colors duration-500 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono uppercase tracking-widest shadow-[0_0_10px_rgba(8,145,178,0.4)]">
              Target Locked
            </span>
            <span className="text-[9px] text-cyan-500 font-mono flex items-center gap-1 uppercase">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> {food.confidence}% MATCH
            </span>
          </div>
          <h3 className="font-display font-bold text-2xl text-white uppercase tracking-[0.1em]">{food.foodName}</h3>
          <p className="text-[11px] font-mono text-cyan-500/80 uppercase tracking-widest mt-1">
            QTY: {food.quantity} {food.unit} | WEIGHT: {food.estimatedWeightGrams}g
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-4xl font-display font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.5)]">{food.calories}</div>
          <div className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest">KCAL</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 relative z-10">
        <MacroStat label="Protein" value={food.protein} />
        <MacroStat label="Carbs" value={food.carbs} />
        <MacroStat label="Fat" value={food.fat} />
        <MacroStat label="Fiber" value={food.fiber} />
      </div>

      <div className="flex justify-between items-center relative z-10 border-t border-cyan-900/50 pt-4 mt-2">
        <div className="text-[9px] font-mono text-cyan-700 uppercase tracking-widest">
          SOURCE: {food.source}
        </div>
        <div className="flex gap-3">
          {onReject && (
            <button 
              onClick={onReject}
              className="px-4 py-2 text-[10px] font-mono text-cyan-600 hover:text-red-400 hover:bg-red-950/30 uppercase tracking-widest transition-colors rounded"
            >
              Discard
            </button>
          )}
          <button 
            onClick={onConfirm}
            className="group/btn relative px-6 py-2 bg-cyan-950/80 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all overflow-hidden flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:animate-[shimmer_0.5s_forwards]" />
            <Zap className="w-4 h-4 fill-current" />
            <span>Accept Target</span>
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};
