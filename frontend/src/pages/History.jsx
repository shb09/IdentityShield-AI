import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiGet } from '../api';
import RiskBadge from '../components/RiskBadge';
import { Search, Clock, ChevronRight, Filter } from 'lucide-react';

export default function History() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    apiGet('/api/cases?limit=100')
      .then(data => { setCases(data.cases || []); setTotal(data.total || 0); })
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = cases.filter(c => {
    const matchSearch = !search || c.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.risk_level === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Screening History</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{total} total cases</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3" style={{ background: 'var(--gradient-card)' }}>
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search by Case ID..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-11 pr-4 py-2.5 text-xs" />
        </div>
        <div className="flex gap-1.5">
          {['all', 'LOW', 'MEDIUM', 'HIGH'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200"
              style={{
                background: filter === f ? 'var(--accent-gradient)' : 'var(--bg-input)',
                color: filter === f ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${filter === f ? 'transparent' : 'var(--border-card)'}`,
                boxShadow: filter === f ? '0 4px 16px var(--accent-glow)' : 'none',
              }}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden" style={{ background: 'var(--gradient-card)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-card)', borderTopColor: 'var(--accent)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No cases found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  {['Case ID', 'Date', 'Type', 'Risk Score', 'Level', ''].map((h, i) => (
                    <th key={i} className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} onClick={() => navigate(`/screening/${c.id}`)} className="cursor-pointer transition-all duration-200"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-glass)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{c.id}</span>
                      {(c.demo_mode === 1 || c.demo_mode === true) && (
                        <span className="ml-2 badge-info text-[9px] px-1.5 py-0.5 rounded-md font-bold">DEMO</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5 text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{c.document_type?.replace('_', ' ')}</td>
                    <td className="px-5 py-3.5"><span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{c.risk_score}/100</span></td>
                    <td className="px-5 py-3.5"><RiskBadge level={c.risk_level} score={c.risk_score} /></td>
                    <td className="px-5 py-3.5"><ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
