import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

const statusConfig = {
  PASS: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  MATCH: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  WARNING: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  POSSIBLE_MATCH: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  FAIL: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
  SUSPICIOUS: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
  MISMATCH: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
  NOT_DETECTED: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-100' },
};

export default function StatusCard({ title, status, detail, children }) {
  const config = statusConfig[status] || statusConfig.PASS;
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-2xl border border-indigo-100/50 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-indigo-50">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-gray-700">{title}</h3>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bg} ${config.border} border`}>
            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
            <span className={`text-[11px] font-bold ${config.color}`}>{status}</span>
          </div>
        </div>
        {detail && <p className="text-xs text-gray-400 mt-1">{detail}</p>}
      </div>
      {children && <div className="px-5 py-4">{children}</div>}
    </div>
  );
}
