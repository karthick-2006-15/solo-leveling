import React, { useEffect, useState } from 'react';
import { fetchAnalytics, type BucketedPoint } from '../../api/analyticsApi';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { SystemWindow } from '../ui/SystemWindow';

export const WeeklyProgressWidget: React.FC = () => {
  const [data, setData] = useState<BucketedPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics('xp_growth', 'day')
      .then((res) => {
        // Just take the last 7 days
        setData(res.slice(-7));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse text-neonBlue text-sm">Loading Chart...</div>;
  if (!data || data.length === 0) return <div className="text-textMuted text-sm">No activity this week</div>;

  return (
    <SystemWindow title="XP Growth Trajectory" innerClassName="p-4" className="w-full">
      <div className="w-full h-48 min-h-[200px] p-2 relative z-10">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart data={data}>
            <Tooltip 
              contentStyle={{ backgroundColor: '#05070B', border: '1px solid #00E5FF', borderRadius: '4px', padding: '8px', boxShadow: '0 0 10px rgba(0,229,255,0.2)' }}
              itemStyle={{ color: '#00E5FF', fontSize: '14px', fontFamily: 'monospace', fontWeight: 'bold' }}
              labelStyle={{ display: 'none' }}
            />
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#00E5FF" 
              strokeWidth={3} 
              dot={{ fill: '#00E5FF', strokeWidth: 2, r: 4 }} 
              activeDot={{ r: 6, fill: '#fff', stroke: '#00E5FF', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SystemWindow>
  );
};
