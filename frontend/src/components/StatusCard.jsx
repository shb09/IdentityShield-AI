import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatusCard({ title, value, subtitle, icon: Icon, trend, color = 'var(--accent)' }) {
  return (
    <div className="glass-card glass-card-hover p-5" style={{ background: 'var(--gradient-card)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}10`, color }}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: trend > 0 ? 'var(--success)' : trend < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{title}</p>
      {subtitle && <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  );
}
