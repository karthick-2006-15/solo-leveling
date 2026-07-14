import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { monarchApi } from '../api/monarchApi';
import { PageHeader } from '../components/ui/PageHeader';
import { Crown, Zap, ShieldAlert, Swords, BrainCircuit, Dna } from 'lucide-react';
import { SystemWindow } from '../components/ui/SystemWindow';
import { PrimaryButton } from '../components/ui/PrimaryButton';

export const InnerMonarch: React.FC = () => {
  const queryClient = useQueryClient();
  const [insightIndex, setInsightIndex] = useState(0);

  const { data: monarchData, isLoading } = useQuery({
    queryKey: ['monarch'],
    queryFn: async () => {
      const res = await monarchApi.getMonarchState();
      return res.data;
    }
  });

  const battleMutation = useMutation({
    mutationFn: () => monarchApi.triggerManualBattle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monarch'] });
    }
  });

  if (isLoading) return <div className="text-center mt-20 text-[var(--color-system-blue)] font-mono animate-pulse">AWAKENING MONARCH SYSTEM...</div>;

  const monarch = monarchData?.monarch;
  const chapter = monarchData?.chapter;

  if (!monarch) return <div className="text-center mt-20 text-red-500 font-mono">Failed to load Monarch data.</div>;

  const attributes = monarch.attributes;
  const radarData = [
    { subject: 'Willpower', A: attributes.willpower, fullMark: 100 },
    { subject: 'Focus', A: attributes.focus, fullMark: 100 },
    { subject: 'Discipline', A: attributes.discipline, fullMark: 100 },
    { subject: 'Wisdom', A: attributes.wisdom, fullMark: 100 },
    { subject: 'Resilience', A: attributes.resilience, fullMark: 100 },
    { subject: 'Courage', A: attributes.courage, fullMark: 100 },
    { subject: 'Consistency', A: attributes.consistency, fullMark: 100 },
    { subject: 'Patience', A: attributes.patience, fullMark: 100 },
    { subject: 'Adaptability', A: attributes.adaptability, fullMark: 100 },
    { subject: 'Control', A: attributes.selfControl, fullMark: 100 },
  ];

  const shadowWinning = monarch.latestShadowStrength > monarch.latestInnerStrength;

  // Generate Dynamic Insights
  const insights = [];
  
  // Find highest attribute
  const legacyAttrs = ['willpower', 'focus', 'discipline', 'wisdom', 'resilience', 'courage', 'consistency', 'patience', 'adaptability', 'selfControl'];
  let maxAttr = legacyAttrs[0];
  let maxVal = attributes[maxAttr as keyof typeof attributes] || 0;
  let minAttr = legacyAttrs[0];
  let minVal = attributes[minAttr as keyof typeof attributes] || 0;

  for (const key of legacyAttrs) {
    const val = attributes[key as keyof typeof attributes] as number;
    if (val > maxVal) { maxVal = val; maxAttr = key; }
    if (val < minVal) { minVal = val; minAttr = key; }
  }

  insights.push(`Your ${maxAttr.charAt(0).toUpperCase() + maxAttr.slice(1)} is becoming your strongest attribute (${maxVal.toFixed(1)}).`);
  
  if (shadowWinning) {
    insights.push(`The Shadow of Procrastination is gaining influence. You must counteract this immediately.`);
  } else {
    insights.push(`The Shadow's influence is waning. Keep pressing forward.`);
  }

  if (attributes.corruption > 50) {
    insights.push(`Corruption levels are dangerously high (${attributes.corruption.toFixed(1)}%). Implement recovery protocols.`);
  } else {
    insights.push(`Your system remains pure. Corruption is under control.`);
  }

  if (minVal < 20) {
    insights.push(`Your ${minAttr.charAt(0).toUpperCase() + minAttr.slice(1)} is critically low (${minVal.toFixed(1)}). Focus on improving this weakness.`);
  } else {
    insights.push(`Your baseline stats are stable. Consistency requires daily commitment. Do not break the streak.`);
  }

  return (
    <div className="relative min-h-screen text-white font-mono">
      {/* Background with glowing effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black" />
        <div className={`absolute inset-0 transition-opacity duration-1000 ${shadowWinning ? 'opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-transparent to-transparent' : 'opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent'}`} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-20" />
      </div>

      <div className="space-y-6 pb-20 md:pb-8 relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <PageHeader 
            title="Inner Monarch" 
            subtitle="The manifestation of your internal strength." 
          />
          <div className="flex gap-3 md:gap-4">
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Evolution Stage</div>
              <div className="text-xl md:text-2xl font-display text-indigo-400 font-bold uppercase tracking-wider text-shadow-glow">
                {monarch.evolutionStage}
              </div>
            </div>
            <div className="text-right border-l border-indigo-900/50 pl-4">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Monarch Level</div>
              <div className="text-xl md:text-2xl font-display text-cyan-400 font-bold tracking-wider">
                {monarch.monarchLevel}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* RADAR CHART */}
          <div className="lg:col-span-2">
            <SystemWindow title="Monarch Attributes" className="h-[350px] md:h-[450px]" innerClassName="p-0 h-full flex flex-col relative">
              <div className="absolute inset-0 bg-black/60 pointer-events-none" />
              <div className="flex-1 w-full relative z-10 p-4 flex flex-col items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(99, 102, 241, 0.2)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} 
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Radar
                      name="Monarch Strength"
                      dataKey="A"
                      stroke="#818cf8"
                      strokeWidth={2}
                      fill="#818cf8"
                      fillOpacity={0.3}
                      activeDot={{ r: 4, fill: '#fff', stroke: '#818cf8' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </SystemWindow>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* INNER BATTLE */}
            <SystemWindow title="The Inner Battle">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center bg-black/40 p-4 border border-indigo-900/40 rounded shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-transparent pointer-events-none" />
                   <div className="flex items-center gap-3 relative z-10">
                     <Crown className="text-indigo-400 w-6 h-6" />
                     <div>
                       <div className="text-[10px] text-gray-500 uppercase tracking-widest">Inner Strength</div>
                       <div className="text-xl text-white font-display">{monarch.latestInnerStrength.toFixed(1)}</div>
                     </div>
                   </div>
                </div>

                <div className="flex justify-center -my-2 relative z-20">
                   <div className="bg-black border border-gray-800 p-2 rounded-full">
                     <Swords className="text-gray-500 w-4 h-4" />
                   </div>
                </div>

                <div className="flex justify-between items-center bg-black/40 p-4 border border-red-900/40 rounded shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-l from-red-900/20 to-transparent pointer-events-none" />
                   <div className="flex items-center gap-3 relative z-10 w-full justify-end">
                     <div className="text-right">
                       <div className="text-[10px] text-gray-500 uppercase tracking-widest">Shadow Power</div>
                       <div className="text-xl text-red-400 font-display">{monarch.latestShadowStrength.toFixed(1)}</div>
                     </div>
                     <ShieldAlert className="text-red-400 w-6 h-6" />
                   </div>
                </div>
                
                {shadowWinning ? (
                  <div className="mt-2 text-center text-[11px] text-red-400 uppercase tracking-wider font-bold animate-pulse">
                    WARNING: Shadow Power dominates. Generate Recovery Quests.
                  </div>
                ) : (
                  <div className="mt-2 text-center text-[11px] text-indigo-400 uppercase tracking-wider font-bold">
                    Monarch is in control.
                  </div>
                )}

                <PrimaryButton onClick={() => battleMutation.mutate()} disabled={battleMutation.isPending} className="mt-2 text-[10px] !py-2 min-h-[44px]">
                  EVALUATE BATTLE (DEV)
                </PrimaryButton>
              </div>
            </SystemWindow>

            {/* INSIGHTS */}
            <SystemWindow title="System Insights">
               <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded min-h-[100px] flex items-center justify-center relative cursor-pointer group" onClick={() => setInsightIndex((prev) => (prev + 1) % insights.length)}>
                 <BrainCircuit className="absolute top-2 right-2 w-4 h-4 text-indigo-500/50 group-hover:text-indigo-400 transition-colors" />
                 <p className="text-sm font-mono text-indigo-100/90 text-center leading-relaxed">"{insights[insightIndex]}"</p>
               </div>
            </SystemWindow>

          </div>
        </div>

        {/* BOTTOM SECTION: ABILITIES & CHAPTERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
           <SystemWindow title="Monarch Abilities">
             {monarch.unlockedAbilities?.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {monarch.unlockedAbilities.map((ab: string) => (
                   <div key={ab} className="px-3 py-1.5 bg-indigo-900/30 border border-indigo-500/30 rounded text-indigo-300 text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                     <Zap size={12} /> {ab}
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-[11px] text-gray-500 uppercase tracking-widest text-center py-6">
                 No abilities awakened.
               </div>
             )}
           </SystemWindow>

           <SystemWindow title="Life Chapters">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded bg-cyan-950/50 border border-cyan-800 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                 <Dna className="text-cyan-400 w-6 h-6" />
               </div>
               <div>
                 <div className="text-[10px] text-gray-500 uppercase tracking-widest">Active Chapter {chapter?.activeChapter || 1}</div>
                 <div className="text-lg font-display text-white uppercase tracking-wider">{chapter?.chapterName || 'Awakening'}</div>
               </div>
             </div>
           </SystemWindow>
        </div>

      </div>
    </div>
  );
};
