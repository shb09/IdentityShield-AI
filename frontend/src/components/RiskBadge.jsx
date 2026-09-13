import React from 'react';

const riskConfig = {
  LOW: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'LOW RISK' },
  MEDIUM: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'MEDIUM RISK' },
  HIGH: { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)', label: 'HIGH RISK' },
};

export default function RiskBadge({ level, score, size = 'md' }) {
  const config = riskConfig[level] || riskConfig.LOW;

  if (size === 'lg') {
    return (
      <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl" style={{ background: config.bg }}>
        <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: config.color }} />
        <span className="text-lg font-bold" style={{ color: config.color }}>{config.label}</span>
        {score !== undefined && (
          <span className="text-base font-mono opacity-60" style={{ color: config.color }}>{score}/100</span>
        )}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: config.bg, color: config.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
      {config.label}
      {score !== undefined && <span className="ml-0.5 opacity-60">{score}</span>}
    </span>
  );
}
