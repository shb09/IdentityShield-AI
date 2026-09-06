import React from 'react';

const riskConfig = {
  LOW: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'LOW RISK',
  },
  MEDIUM: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    label: 'MEDIUM RISK',
  },
  HIGH: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-500',
    label: 'HIGH RISK',
  },
};

export default function RiskBadge({ level, score, size = 'md' }) {
  const config = riskConfig[level] || riskConfig.LOW;

  if (size === 'lg') {
    return (
      <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border-2 ${config.bg} ${config.border}`}>
        <div className={`w-3 h-3 rounded-full ${config.dot} animate-pulse`} />
        <span className={`text-xl font-bold ${config.text}`}>{config.label}</span>
        {score !== undefined && (
          <span className={`text-lg font-mono ${config.text} opacity-75`}>{score}/100</span>
        )}
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${config.border} border`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
      {score !== undefined && <span className="ml-1 opacity-70">{score}</span>}
    </span>
  );
}
