import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, trend, color }) => {
  return (
    <div className="glass p-6 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div style={{ color: color || 'var(--primary)' }} className="p-3 bg-white/5 rounded-xl">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-500/10 text-success' : 
            trend === 'down' ? 'bg-red-500/10 text-danger' : 
            'bg-gray-500/10 text-text-muted'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} 
          </span>
        )}
      </div>
      <h3 className="text-text-muted text-sm font-medium uppercase tracking-wider">{title}</h3>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl font-bold">{value}</span>
      </div>
      {subtitle && <p className="text-text-muted text-xs mt-2">{subtitle}</p>}
    </div>
  );
};

export default StatsCard;
