import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

const statusConfig = {
  PASS: { icon: CheckCircle, color: 'var(--success)', badge: 'badge-success' },
  MATCH: { icon: CheckCircle, color: 'var(--success)', badge: 'badge-success' },
  WARNING: { icon: AlertTriangle, color: 'var(--warning)', badge: 'badge-warning' },
  POSSIBLE_MATCH: { icon: AlertTriangle, color: 'var(--warning)', badge: 'badge-warning' },
  FAIL: { icon: XCircle, color: 'var(--danger)', badge: 'badge-danger' },
  SUSPICIOUS: { icon: XCircle, color: 'var(--danger)', badge: 'badge-danger' },
  MISMATCH: { icon: XCircle, color: 'var(--danger)', badge: 'badge-danger' },
  NOT_DETECTED: { icon: Clock, color: 'var(--text-muted)', badge: 'badge-info' },
};

export default function StatusCard({ title, status, detail, children }) {
  const config = statusConfig[status] || statusConfig.PASS;
  const Icon = config.icon;

  return (
    <div className="glass-card overflow-hidden" style={{ background: 'var(--gradient-card)' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-glass)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.badge}`}>
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">{status}</span>
          </div>
        </div>
        {detail && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{detail}</p>}
      </div>
      {children && <div className="px-5 py-4">{children}</div>}
    </div>
  );
}
