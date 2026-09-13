import React from 'react';

const riskConfig = {
  LOW: { color: 'var(--success)', label: 'LOW RISK' },
  MEDIUM: { color: 'var(--warning)', label: 'MEDIUM RISK' },
  HIGH: { color: 'var(--danger)', label: 'HIGH RISK' },
};

export default function RiskBadge({ level, score, size = 'md' }) {
  const config = riskConfig[level] || riskConfig.LOW;

  if (size === 'lg') {
    return (
      <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl" style={{ background: `color-mix(in srgb, ${config.color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${config.color} 20%, transparent)` }}>
        <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: config.color, boxShadow: `0 0 12px ${config.color}` }} />
        <span className="text-lg font-bold" style={{ color: config.color }}>{config.label}</span>
        {score !== undefined && (
          <span className="text-base font-mono opacity-60" style={{ color: config.color }}>{score}/100</span>
        )}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: `color-mix(in srgb, ${config.color} 10%, transparent)`, color: config.color, border: `1px solid color-mix(in srgb, ${config.color} 15%, transparent)` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
      {config.label}
      {score !== undefined && <span className="ml-0.5 opacity-60">{score}</span>}
    </span>
  );
}
