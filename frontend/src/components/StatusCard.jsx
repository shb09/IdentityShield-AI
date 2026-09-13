import React from 'react';

export default function StatusCard({ title, value, icon: Icon, color = 'var(--gradient-1)' }) {
  return (
    <div className="card card-hover p-4 relative overflow-hidden inter">
      <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ background: color }} />
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color }}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{title}</p>
    </div>
  );
}
