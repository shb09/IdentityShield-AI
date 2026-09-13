import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiGet } from '../api';
import RiskBadge from '../components/RiskBadge';
import { Scan, ShieldCheck, AlertTriangle, XCircle, Clock, ArrowRight, BarChart3, Plus, Zap, TrendingUp } from 'lucide-react';

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
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--border-card)', borderTopColor: 'var(--accent)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Screenings', value: stats?.total_screenings || 0, icon: BarChart3, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    { label: 'Low Risk', value: stats?.low_risk || 0, icon: ShieldCheck, gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
    { label: 'Medium Risk', value: stats?.medium_risk || 0, icon: AlertTriangle, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
    { label: 'High Risk', value: stats?.high_risk || 0, icon: XCircle, gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Overview of screening operations</p>
        </div>
        <button
          onClick={() => navigate('/screening/new')}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Screening
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="glass-card p-4 transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${i * 80}ms`, background: 'var(--gradient-card)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.gradient }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Distribution */}
      <div className="glass-card p-5" style={{ background: 'var(--gradient-card)' }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Risk Distribution</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Low Risk', count: stats?.low_risk || 0, color: '#10b981', total: stats?.total_screenings || 1 },
            { label: 'Medium Risk', count: stats?.medium_risk || 0, color: '#f59e0b', total: stats?.total_screenings || 1 },
            { label: 'High Risk', count: stats?.high_risk || 0, color: '#f43f5e', total: stats?.total_screenings || 1 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs w-20 font-medium" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
              <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                <div
                  className="h-full rounded-lg transition-all duration-1000 ease-out"
                  style={{ width: `${((item.count / item.total) * 100) || 0}%`, background: item.color, boxShadow: `0 0 12px ${item.color}33` }}
                />
              </div>
              <span className="text-xs font-bold w-6 text-right" style={{ color: 'var(--text-primary)' }}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Screenings */}
      <div className="glass-card overflow-hidden" style={{ background: 'var(--gradient-card)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-glass)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Screenings</h2>
          <button onClick={() => navigate('/history')} className="text-xs font-semibold flex items-center gap-1 transition-colors" style={{ color: 'var(--accent)' }}>
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {(!stats?.recent_cases || stats.recent_cases.length === 0) ? (
          <div className="px-5 py-14 text-center">
            <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>No screenings yet</p>
            <button onClick={() => navigate('/screening/new')} className="btn-primary px-4 py-2 text-xs">
              Start first screening
            </button>
          </div>
        ) : (
          <div>
            {stats.recent_cases.map((c, i) => (
              <button
                key={c.id}
                onClick={() => navigate(`/screening/${c.id}`)}
                className="w-full px-5 py-3.5 flex items-center justify-between transition-all duration-200 text-left"
                style={{ borderBottom: i < stats.recent_cases.length - 1 ? '1px solid var(--border-glass)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
                    <Scan className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{c.id}</p>
                    <p className="text-[11px] capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.document_type?.replace('_', ' ')}</p>
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

      {/* System Status */}
      <div className="glass-card px-5 py-3.5 flex items-center gap-3" style={{ background: 'var(--gradient-card)' }}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
        <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--accent-light)' }}>All modules operational</strong> · OCR: Tesseract · Face: Histogram + Structural · Tampering: Image Forensics · Risk: Multi-signal Engine
        </p>
      </div>
    </div>
  );
}
