import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api';
import RiskBadge from '../components/RiskBadge';
import { Shield, Clock, Filter, Search, ChevronRight, FileText } from 'lucide-react';

const documentLabels = {
  passport: 'Passport', national_id: 'National ID', visa: 'Visa',
  driving_license: 'Driving License', permit: 'Permit',
};

export default function History() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet('/api/screening?limit=100');
        if (res.ok) {
          const data = await res.json();
          setCases(Array.isArray(data) ? data : data.cases || []);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = cases.filter(c => {
    const matchFilter = filter === 'all' || (c.risk_level || '').toUpperCase() === filter;
    const matchSearch = !search || (c.document_type || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-card)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Screening History</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{cases.length} total screenings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search document type..."
            className="glass-input w-full pl-10 pr-4 py-2.5 text-sm" />
        </div>
        <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--bg-input)' }}>
          {['all', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: filter === f ? 'var(--accent-gradient)' : 'transparent',
                color: filter === f ? 'white' : 'var(--text-muted)',
              }}>
              {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden" style={{ background: 'var(--gradient-card)' }}>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-15" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {cases.length === 0 ? 'No screenings yet' : 'No matching results'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card)' }}>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>ID</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Document</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Risk</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Score</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Date</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id || c.screening_id} className="transition-colors duration-150"
                    style={{ borderBottom: '1px solid var(--border-card)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        #{(c.id || c.screening_id || '').slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                        {documentLabels[c.document_type] || c.document_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><RiskBadge level={c.risk_level} size="sm" /></td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{Math.round(c.risk_score || 0)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link to={`/screening/${c.id || c.screening_id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-200"
                        style={{ color: 'var(--accent)', background: 'var(--accent-glow)' }}>
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
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
