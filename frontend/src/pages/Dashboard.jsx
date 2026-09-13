import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api';
import RiskBadge from '../components/RiskBadge';
import { FileSearch, AlertTriangle, CheckCircle, Clock, Plus, ArrowRight, Shield, TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const statsData = await apiGet('/api/dashboard/stats');
        setStats(statsData);
        const casesData = await apiGet('/api/cases?limit=5');
        setRecent(Array.isArray(casesData) ? casesData : casesData.cases || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 anim-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const s = stats || { total_screenings: 0, high_risk: 0, medium_risk: 0, low_risk: 0, avg_risk_score: 0 };

  const statCards = [
    { label: 'Total', value: s.total_screenings, gradient: 'var(--gradient-1)', icon: FileSearch },
    { label: 'High Risk', value: s.high_risk, gradient: 'var(--gradient-4)', icon: AlertTriangle },
    { label: 'Low Risk', value: s.low_risk, gradient: 'var(--gradient-3)', icon: CheckCircle },
    { label: 'Avg Score', value: Math.round(s.avg_risk_score || 0), gradient: 'var(--gradient-5)', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 anim-fade-up">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Document screening overview</p>
        </div>
        <Link to="/screening/new" className="btn btn-accent px-4 py-2 text-xs flex items-center gap-1.5 inter">
          <Plus className="w-3.5 h-3.5" /> New Screening
        </Link>
      </div>

      {/* Stat Cards — gradient accent strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="card card-hover p-4 relative overflow-hidden inter">
              <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ background: c.gradient }} />
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.gradient, opacity: 0.9 }}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{c.value}</p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Risk Distribution */}
      <div className="card p-5" style={{ background: 'var(--gradient-surface)' }}>
        <h3 className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Risk Distribution</h3>
        <div className="space-y-3">
          {[
            { label: 'High', count: s.high_risk, total: s.total_screenings, gradient: 'var(--gradient-4)' },
            { label: 'Medium', count: s.medium_risk, total: s.total_screenings, gradient: 'var(--gradient-2)' },
            { label: 'Low', count: s.low_risk, total: s.total_screenings, gradient: 'var(--gradient-3)' },
          ].map(item => {
            const pct = item.total > 0 ? (item.count / item.total) * 100 : 0;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-[11px] font-medium w-12 shrink-0" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                  <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.max(pct, 2)}%`, background: item.gradient }} />
                </div>
                <span className="text-xs font-bold w-6 text-right shrink-0" style={{ color: 'var(--text-primary)' }}>{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Cases */}
      <div className="card p-5" style={{ background: 'var(--gradient-surface)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Recent Cases</h3>
          <Link to="/history" className="text-[11px] font-medium flex items-center gap-1 inter" style={{ color: 'var(--accent)' }}>
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center anim-float" style={{ background: 'var(--gradient-1)', opacity: 0.15 }}>
              <Shield className="w-7 h-7" style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No screenings yet</p>
            <Link to="/screening/new" className="btn btn-accent inline-flex items-center gap-1.5 mt-4 px-5 py-2 text-xs inter">
              <Sparkles className="w-3.5 h-3.5" /> Start First
            </Link>
          </div>
        ) : (
          <div className="space-y-2 stagger">
            {recent.map(c => (
              <Link key={c.id || c.screening_id} to={`/screening/${c.id || c.screening_id}`}
                className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 inter"
                style={{ background: 'var(--bg-input)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-input)'; }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.risk_level === 'HIGH' ? 'var(--gradient-4)' : c.risk_level === 'MEDIUM' ? 'var(--gradient-2)' : 'var(--gradient-3)' }}>
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{c.document_type?.replace('_', ' ').toUpperCase()}</span>
                    <RiskBadge level={c.risk_level} size="sm" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
