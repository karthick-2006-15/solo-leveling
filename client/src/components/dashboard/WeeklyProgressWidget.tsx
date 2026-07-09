import React, { useEffect, useState } from 'react';
import { fetchAnalytics, type BucketedPoint } from '../../api/analyticsApi';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

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
    <div className="w-full h-48 min-h-[200px] p-2">
      <ResponsiveContainer width="99%" height="100%">
        <LineChart data={data}>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #4a00e0', borderRadius: '8px', padding: '4px' }}
            itemStyle={{ color: '#fff', fontSize: '12px' }}
            labelStyle={{ display: 'none' }}
          />
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#4a00e0" 
            strokeWidth={3} 
            dot={{ fill: '#4a00e0', strokeWidth: 2, r: 4 }} 
            activeDot={{ r: 6, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
