import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface RadarChartWidgetProps {
  primaryAttributes: Record<string, number>;
}

export const RadarChartWidget: React.FC<RadarChartWidgetProps> = ({ primaryAttributes }) => {
  const data = [
    { subject: 'STR', A: primaryAttributes.STR, fullMark: 100 },
    { subject: 'AGI', A: primaryAttributes.AGI, fullMark: 100 },
    { subject: 'END', A: primaryAttributes.END, fullMark: 100 },
    { subject: 'INT', A: primaryAttributes.INT, fullMark: 100 },
    { subject: 'WIS', A: primaryAttributes.WIS, fullMark: 100 },
    { subject: 'PER', A: primaryAttributes.PER, fullMark: 100 },
  ];

  return (
    <div className="bg-[#05070a]/80 border border-cyan-900/50 rounded-lg p-4 md:p-5 h-64 md:h-80 flex flex-col relative overflow-hidden">
      <h3 className="text-cyan-500 uppercase tracking-widest text-sm mb-2 border-b border-cyan-900/50 pb-2 z-10 relative">
        Attribute Matrix
      </h3>
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-cyan-900/10 rounded-full blur-[60px] opacity-50" />

      <div className="flex-1 w-full h-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(34, 211, 238, 0.2)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'rgba(34, 211, 238, 0.8)', fontSize: 10, fontFamily: 'monospace' }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 10']} tick={false} axisLine={false} />
            <Radar 
              name="Monarch Attributes" 
              dataKey="A" 
              stroke="#06b6d4" 
              fill="#06b6d4" 
              fillOpacity={0.3} 
              dot={{ r: 2, fill: '#22d3ee' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
