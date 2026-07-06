import React, { useState } from 'react';
import { SystemWindow } from '../components/ui/SystemWindow';
import { PageHeader } from '../components/ui/PageHeader';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { generateMealPlan } from '../api/aiApi';
import { Bot, RefreshCw, ChefHat, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const MealPlanner: React.FC = () => {
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const plan = await generateMealPlan();
      setMealPlan(plan);
    } catch (err: any) {
      setError(err.message || "Failed to generate meal plan. Is ARIA online?");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <PageHeader 
        title="ARIA Nutritionist" 
        subtitle="AI-driven metabolic planning." 
      />
      
      <div className="max-w-4xl mx-auto space-y-6">
        <SystemWindow className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
          <div className="w-16 h-16 rounded-[2px] bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.3)] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <ChefHat className="w-8 h-8 text-[var(--color-system-violet)]" />
          </div>
          <h2 className="font-display font-bold text-[18px] uppercase tracking-wider text-white mb-2">Automated Meal Synthesis</h2>
          <p className="font-mono text-[12px] text-[var(--color-system-text-dim)] uppercase tracking-widest max-w-lg mb-8">
            ARIA will analyze your biometric profile, targets, and current progression to synthesize a daily meal protocol.
          </p>
          <PrimaryButton onClick={handleGenerate} disabled={isGenerating} className="min-w-[200px] !py-3 flex items-center justify-center gap-2">
            {isGenerating ? (
              <><RefreshCw size={16} className="animate-spin" /> SYNTHESIZING...</>
            ) : (
              <><Bot size={16} /> GENERATE PROTOCOL</>
            )}
          </PrimaryButton>
          {error && <div className="mt-4 text-[10px] font-mono text-red-500 uppercase tracking-widest">{error}</div>}
        </SystemWindow>

        {mealPlan && (
          <SystemWindow title="Generated Protocol" variant="purple">
            <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:text-[var(--color-system-violet)] prose-headings:tracking-widest prose-a:text-[var(--color-system-blue)] font-body text-[14px] leading-relaxed">
              <ReactMarkdown>{mealPlan.content}</ReactMarkdown>
            </div>
            <div className="mt-8 pt-4 border-t border-[rgba(168,85,247,0.2)] flex justify-end">
              <span className="text-[10px] font-mono tracking-widest text-[var(--color-system-text-dim)] uppercase flex items-center gap-1">
                <Check size={12} className="text-green-500" /> SYNCED TO SYSTEM
              </span>
            </div>
          </SystemWindow>
        )}
      </div>
    </div>
  );
};
