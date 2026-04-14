import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface FactorImpactProps {
  impacts: Array<{
    feature: string;
    impact: number;
    current_value: string;
  }>;
}

const FactorImpact: React.FC<FactorImpactProps> = ({ impacts }) => {
  // Sort impacts by magnitude
  const sortedData = [...impacts].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return (
    <div className="mt-8">
      <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">
        Top Risk Drivers
      </h4>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ left: 20, right: 20 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="feature" 
              type="category" 
              stroke="#94a3b8" 
              fontSize={12}
              width={100}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass p-3 text-xs">
                      <div className="font-bold mb-1">{data.feature}</div>
                      <div className="text-text-muted mb-1">Value: {data.current_value}</div>
                      <div style={{ color: data.impact > 0 ? '#ef4444' : '#10b981' }}>
                        {data.impact > 0 ? '+' : ''}{(data.impact * 100).toFixed(1)}% Risk
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.impact > 0 ? '#ef4444' : '#10b981'} 
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FactorImpact;
