import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface RiskGaugeProps {
  probability: number;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ probability }) => {
  const data = [
    { value: probability },
    { value: 1 - probability },
  ];

  const getColor = (prob: number) => {
    if (prob > 0.6) return '#ef4444'; // Red
    if (prob > 0.3) return '#f59e0b'; // Amber
    return '#10b981'; // Green
  };

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={100}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={getColor(probability)} />
              <Cell fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="mt-[-40px] text-center"
      >
        <div className="text-5xl font-black mb-1" style={{ color: getColor(probability) }}>
          {Math.round(probability * 100)}%
        </div>
        <div className="text-sm font-bold uppercase tracking-widest text-text-muted">
          Churn Risk Score
        </div>
      </motion.div>
    </div>
  );
};

export default RiskGauge;
