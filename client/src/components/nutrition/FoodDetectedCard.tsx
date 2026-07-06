import React from 'react';
import { CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import type { AnalyzedFood } from '../../types/nutrition';

interface FoodDetectedCardProps {
  food: AnalyzedFood;
  onConfirm: () => void;
  onReject?: () => void;
}

const MacroBar = ({ label, value, max, colorClass }: { label: string, value: number, max: number, colorClass: string }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px] font-mono text-[var(--color-system-text-dim)] uppercase">
        <span>{label}</span>
        <span>{value}g</span>
      </div>
      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const FoodDetectedCard: React.FC<FoodDetectedCardProps> = ({ food, onConfirm, onReject }) => {
  const isConfident = food.confidence >= 70;

  return (
    <div className="w-full bg-[rgba(0,10,20,0.6)] border border-cyan-800 rounded p-6 mb-4 relative overflow-hidden backdrop-blur-sm group hover:border-cyan-500 transition-colors duration-300">
      
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono uppercase tracking-widest">
              System Match
            </span>
            {isConfident ? (
              <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {food.confidence}% CONFIDENCE
              </span>
            ) : (
              <span className="text-[10px] text-yellow-400 font-mono flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {food.confidence}% CONFIDENCE
              </span>
            )}
          </div>
          <h3 className="font-display font-bold text-2xl text-white uppercase tracking-wider">{food.quantity} {food.unit} {food.foodName}</h3>
          <p className="text-[12px] font-mono text-cyan-600 uppercase tracking-widest mt-1">
            EST. WEIGHT: {food.estimatedWeightGrams}g | SOURCE: {food.source}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-display font-bold text-cyan-400">{food.calories}</div>
          <div className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest">KCAL</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 relative z-10">
        <MacroBar label="Protein" value={food.protein} max={100} colorClass="bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
        <MacroBar label="Carbs" value={food.carbs} max={200} colorClass="bg-orange-500 shadow-[0_0_8px_#f97316]" />
        <MacroBar label="Fat" value={food.fat} max={100} colorClass="bg-red-500 shadow-[0_0_8px_#ef4444]" />
        <MacroBar label="Fiber" value={food.fiber} max={40} colorClass="bg-green-500 shadow-[0_0_8px_#22c55e]" />
      </div>

      {!isConfident && food.alternatives && food.alternatives.length > 0 && (
        <div className="mb-6 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded relative z-10">
          <p className="text-[11px] font-mono text-yellow-500 uppercase mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Low Confidence. Did you mean?
          </p>
          <div className="flex flex-wrap gap-2">
            {food.alternatives.map((alt, i) => (
              <button key={i} className="text-[10px] bg-black/40 border border-yellow-900 hover:border-yellow-500 text-yellow-100 px-2 py-1 rounded font-mono transition-colors">
                {alt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 relative z-10">
        {onReject && (
          <button 
            onClick={onReject}
            className="px-4 py-2 text-[12px] font-mono text-[var(--color-system-text-dim)] hover:text-red-400 uppercase tracking-widest transition-colors"
          >
            Reject
          </button>
        )}
        <button 
          onClick={onConfirm}
          className="group relative px-6 py-2 bg-cyan-950 border border-cyan-500 text-cyan-400 hover:bg-cyan-900 hover:text-cyan-300 rounded text-[12px] font-mono uppercase tracking-widest font-bold transition-all overflow-hidden flex items-center gap-2"
        >
          <div className="absolute inset-0 bg-cyan-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span>Confirm Meal</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
