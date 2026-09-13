import React from 'react';
import { Shield, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export default function RiskBadge({ level, score, size = 'md' }) {
  const normalized = (level || '').toUpperCase();
  const configs = {
    HIGH: { cls: 'badge-danger', Icon: AlertTriangle, label: 'HIGH' },
    MEDIUM: { cls: 'badge-warning', Icon: AlertCircle, label: 'MED' },
    LOW: { cls: 'badge-success', Icon: CheckCircle, label: 'LOW' },
  };
  const cfg = configs[normalized] || { cls: 'badge-accent', Icon: Shield, label: '—' };
  const Icon = cfg.Icon;

  return (
    <span className={`badge ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
      {score !== undefined && <span className="font-bold">{Math.round(score)}</span>}
    </span>
  );
}
