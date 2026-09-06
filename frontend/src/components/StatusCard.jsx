import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

const statusConfig = {
  PASS: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  MATCH: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  WARNING: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  POSSIBLE_MATCH: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  FAIL: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  SUSPICIOUS: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  MISMATCH: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  NOT_DETECTED: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50' },
};

export default function StatusCard({ title, status, detail, children }) {
  const config = statusConfig[status] || statusConfig.PASS;
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm font-semibold ${config.color}`}>{status}</span>
          </div>
        </div>
        {detail && <p className="text-sm text-slate-500 mt-1">{detail}</p>}
      </div>
      {children && <div className="px-5 py-4">{children}</div>}
    </div>
  );
}
