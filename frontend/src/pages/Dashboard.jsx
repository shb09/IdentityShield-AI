import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api';
import StatusCard from '../components/StatusCard';
import RiskBadge from '../components/RiskBadge';
import { FileSearch, AlertTriangle, CheckCircle, Clock, Plus, ArrowRight, Shield, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, casesRes] = await Promise.all([
          apiGet('/api/dashboard/stats'),
          apiGet('/api/screening?limit=5')
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (casesRes.ok) {
          const data = await casesRes.json();
          setRecent(Array.isArray(data) ? data : data.cases || []);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-card)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  const s = stats || { total_screenings: 0, high_risk_count: 0, medium_risk_count: 0, low_risk_count: 0, avg_risk_score: 0 };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Identity verification overview</p>
        </div>
        <Link to="/screening/new" className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Screening
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard title="Total Screenings" value={s.total_screenings} icon={FileSearch} color="var(--accent)" />
        <StatusCard title="High Risk" value={s.high_risk_count} icon={AlertTriangle} color="var(--danger)" />
        <StatusCard title="Low Risk" value={s.low_risk_count} icon={CheckCircle} color="var(--success)" />
        <StatusCard title="Avg Risk Score" value={Math.round(s.avg_risk_score || 0)} icon={TrendingUp} color="var(--accent)" />
      </div>

      {/* Risk Distribution */}
      <div className="glass-card p-6" style={{ background: 'var(--gradient-card)' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Risk Distribution</h3>
        <div className="space-y-3">
          {[
            { label: 'High Risk', count: s.high_risk_count, total: s.total_screenings, color: 'var(--danger)' },
            { label: 'Medium Risk', count: s.medium_risk_count, total: s.total_screenings, color: 'var(--warning)' },
            { label: 'Low Risk', count: s.low_risk_count, total: s.total_screenings, color: 'var(--success)' },
          ].map(item => {
            const pct = item.total > 0 ? (item.count / item.total) * 100 : 0;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs font-medium w-24" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: item.color }} />
                </div>
                <span className="text-xs font-bold w-8 text-right" style={{ color: 'var(--text-primary)' }}>{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Cases */}
      <div className="glass-card p-6" style={{ background: 'var(--gradient-card)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Cases</h3>
          <Link to="/history" className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--accent)' }}>
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-10">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No screenings yet</p>
            <Link to="/screening/new" className="btn-primary inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs">
              <Plus className="w-3.5 h-3.5" /> Start First Screening
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map(c => (
              <Link key={c.id || c.screening_id} to={`/screening/${c.id || c.screening_id}`}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                style={{ background: 'var(--bg-input)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${c.risk_level === 'HIGH' ? 'rgba(239,68,68,0.08)' : c.risk_level === 'MEDIUM' ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)'}`, color: c.risk_level === 'HIGH' ? 'var(--danger)' : c.risk_level === 'MEDIUM' ? 'var(--warning)' : 'var(--success)' }}>
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{c.document_type?.replace('_', ' ').toUpperCase()}</span>
                    <RiskBadge level={c.risk_level} size="sm" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
