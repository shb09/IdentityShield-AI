import React from 'react';
import { Shield, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export default function RiskBadge({ level, score, size = 'md' }) {
  const normalized = (level || '').toUpperCase();
  const isHigh = normalized === 'HIGH';
  const isMedium = normalized === 'MEDIUM';
  const isLow = normalized === 'LOW';

  const config = {
    HIGH: { bg: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', border: 'rgba(239, 68, 68, 0.15)', Icon: AlertTriangle, label: 'HIGH RISK' },
    MEDIUM: { bg: 'rgba(245, 158, 11, 0.08)', color: 'var(--warning)', border: 'rgba(245, 158, 11, 0.15)', Icon: AlertCircle, label: 'MEDIUM RISK' },
    LOW: { bg: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)', border: 'rgba(16, 185, 129, 0.15)', Icon: CheckCircle, label: 'LOW RISK' },
  }[normalized] || { bg: 'var(--accent-glow)', color: 'var(--accent)', border: 'var(--border-active)', Icon: Shield, label: 'UNKNOWN' };

  const { bg, color, border, Icon, label } = config;

  const sizes = {
    sm: 'px-2.5 py-1 text-[10px] gap-1',
    md: 'px-3 py-1.5 text-xs gap-1.5',
    lg: 'px-4 py-2 text-sm gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg ${sizes[size]}`}
      style={{ background: bg, color, border: `1px solid ${border}` }}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {label}
      {score !== undefined && (
        <span className="font-bold ml-0.5">{Math.round(score)}</span>
      )}
    </span>
  );
}
