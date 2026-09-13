import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api';
import RiskBadge from '../components/RiskBadge';
import { Clock, Search, ChevronRight, FileText } from 'lucide-react';

const docLabels = { passport: 'Passport', national_id: 'National ID', visa: 'Visa', driving_license: 'License', permit: 'Permit' };

export default function History() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet('/api/cases?limit=100');
        setCases(Array.isArray(res) ? res : res.cases || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = cases.filter(c => {
    const mf = filter === 'all' || (c.risk_level || '').toUpperCase() === filter;
    const ms = !search || (c.document_type || '').toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 anim-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  return (
    <div className="space-y-5 anim-fade-up">
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>History</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{cases.length} screenings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="input w-full pl-8 pr-3 py-2 text-xs" />
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--bg-input)' }}>
          {['all', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all inter"
              style={{ background: filter === f ? 'var(--gradient-1)' : 'transparent', color: filter === f ? 'white' : 'var(--text-muted)' }}>
              {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden" style={{ background: 'var(--gradient-surface)' }}>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-15" style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cases.length === 0 ? 'No screenings' : 'No matches'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', 'Document', 'Risk', 'Score', 'Date', ''].map(h => (
                    <th key={h} className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id || c.screening_id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>#{(c.id || '').slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{docLabels[c.document_type] || c.document_type}</span>
                    </td>
                    <td className="px-4 py-2.5"><RiskBadge level={c.risk_level} size="sm" /></td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>{Math.round(c.risk_score || 0)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link to={`/screening/${c.id || c.screening_id}`}
                        className="inline-flex items-center gap-0.5 text-[11px] font-medium px-2 py-1 rounded-md transition-all inter"
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
