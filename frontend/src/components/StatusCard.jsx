import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

const statusConfig = {
  PASS: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' },
  MATCH: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' },
  WARNING: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' },
  POSSIBLE_MATCH: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' },
  FAIL: { icon: XCircle, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.2)' },
  SUSPICIOUS: { icon: XCircle, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.2)' },
  MISMATCH: { icon: XCircle, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.2)' },
  NOT_DETECTED: { icon: Clock, color: '#64748b', bg: 'var(--bg-input)', border: 'var(--border-color)' },
};

export default function StatusCard({ title, status, detail, children }) {
  const config = statusConfig[status] || statusConfig.PASS;
  const Icon = config.icon;

  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border" style={{ background: config.bg, borderColor: config.border }}>
            <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
            <span className="text-[11px] font-bold" style={{ color: config.color }}>{status}</span>
          </div>
        </div>
        {detail && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{detail}</p>}
      </div>
      {children && <div className="px-5 py-4">{children}</div>}
    </div>
  );
}
