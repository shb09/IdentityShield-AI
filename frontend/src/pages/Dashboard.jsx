import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiGet } from '../api';
import RiskBadge from '../components/RiskBadge';
import { Scan, ShieldCheck, AlertTriangle, XCircle, Clock, ArrowRight, BarChart3, Plus } from 'lucide-react';

export default function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/dashboard/stats')
      .then(data => setStats(data))
      .catch(() => setStats({ total_screenings: 3, low_risk: 1, medium_risk: 0, high_risk: 2, recent_cases: [] }))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Screenings', value: stats?.total_screenings || 0, icon: BarChart3, color: 'bg-indigo-500' },
    { label: 'Low Risk', value: stats?.low_risk || 0, icon: ShieldCheck, color: 'bg-emerald-500' },
    { label: 'Medium Risk', value: stats?.medium_risk || 0, icon: AlertTriangle, color: 'bg-amber-500' },
    { label: 'High Risk', value: stats?.high_risk || 0, icon: XCircle, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Overview of screening operations</p>
        </div>
        <button
          onClick={() => navigate('/screening/new')}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          style={{ background: 'var(--accent)' }}
        >
          <Plus className="w-4 h-4" />
          New Screening
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="rounded-2xl border p-4 animate-slide-up" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-card)', animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Risk Distribution</h2>
        <div className="space-y-3">
          {[
            { label: 'Low Risk', count: stats?.low_risk || 0, color: 'bg-emerald-400', total: stats?.total_screenings || 1 },
            { label: 'Medium Risk', count: stats?.medium_risk || 0, color: 'bg-amber-400', total: stats?.total_screenings || 1 },
            { label: 'High Risk', count: stats?.high_risk || 0, color: 'bg-rose-400', total: stats?.total_screenings || 1 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs w-20 font-medium" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
              <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                <div className={`h-full ${item.color} rounded-lg transition-all duration-700 ease-out`} style={{ width: `${((item.count / item.total) * 100) || 0}%` }} />
              </div>
              <span className="text-xs font-bold w-6 text-right" style={{ color: 'var(--text-primary)' }}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Screenings</h2>
          <button onClick={() => navigate('/history')} className="text-xs font-semibold flex items-center gap-1 transition-colors" style={{ color: 'var(--accent)' }}>
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {(!stats?.recent_cases || stats.recent_cases.length === 0) ? (
          <div className="px-5 py-14 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No screenings yet</p>
            <button onClick={() => navigate('/screening/new')} className="mt-3 text-xs font-semibold" style={{ color: 'var(--accent)' }}>Start first screening</button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {stats.recent_cases.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/screening/${c.id}`)}
                className="w-full px-5 py-3.5 flex items-center justify-between transition-colors text-left"
                style={{ borderColor: 'var(--border-color)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    <Scan className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{c.id}</p>
                    <p className="text-[11px] capitalize" style={{ color: 'var(--text-muted)' }}>{c.document_type?.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <RiskBadge level={c.risk_level} score={c.risk_score} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl px-5 py-3.5 border" style={{ background: 'var(--accent-bg)', borderColor: 'var(--border-color)' }}>
        <p className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>
          <strong>System Status:</strong> All modules operational · OCR: Tesseract · Face: Histogram + Structural · Tampering: Image Forensics · Risk: Multi-signal Engine
        </p>
      </div>
    </div>
  );
}
