import React from 'react';

const riskConfig = {
  LOW: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    dot: 'bg-emerald-400',
    label: 'LOW RISK',
  },
  MEDIUM: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-400',
    label: 'MEDIUM RISK',
  },
  HIGH: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    dot: 'bg-rose-400',
    label: 'HIGH RISK',
  },
};

export default function RiskBadge({ level, score, size = 'md' }) {
  const config = riskConfig[level] || riskConfig.LOW;

  if (size === 'lg') {
    return (
      <div className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl ${config.bg}`}>
        <div className={`w-2.5 h-2.5 rounded-full ${config.dot} animate-pulse`} />
        <span className={`text-lg font-bold ${config.text}`}>{config.label}</span>
        {score !== undefined && (
          <span className={`text-base font-mono ${config.text} opacity-60`}>{score}/100</span>
        )}
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
      {score !== undefined && <span className="ml-0.5 opacity-60">{score}</span>}
    </span>
  );
}
