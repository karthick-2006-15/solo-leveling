import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface GrowthTimelineWidgetProps {
  growthTimeline: Array<{ date: string; level: number; overallPower: number }>;
}

export const GrowthTimelineWidget: React.FC<GrowthTimelineWidgetProps> = ({ growthTimeline }) => {
  return (
    <div className="bg-[#05070a]/80 border border-cyan-900/50 rounded-lg p-4 md:p-5 h-64 md:h-80 flex flex-col relative overflow-hidden">
      <h3 className="text-cyan-500 uppercase tracking-widest text-sm mb-4 border-b border-cyan-900/50 pb-2 z-10 relative">
        Growth Timeline
      </h3>

      <div className="flex-1 w-full h-full relative z-10 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={growthTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(val) => {
                const d = new Date(val);
                return `${d.getMonth()+1}/${d.getDate()}`;
              }}
              tick={{ fill: 'rgba(34, 211, 238, 0.5)', fontSize: 10, fontFamily: 'monospace' }} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: 'rgba(34, 211, 238, 0.5)', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(5, 7, 10, 0.9)', borderColor: 'rgba(34, 211, 238, 0.3)', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
              itemStyle={{ color: '#22d3ee' }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}
            />
            <Area type="monotone" dataKey="overallPower" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPower)" name="Power Score" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
