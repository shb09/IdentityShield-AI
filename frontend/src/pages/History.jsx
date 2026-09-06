import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import RiskBadge from '../components/RiskBadge';
import { Search, Filter, Clock, ChevronRight } from 'lucide-react';

export default function History() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/cases?limit=100', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setCases(data.cases || []);
      setTotal(data.total || 0);
    })
    .catch(() => setCases([]))
    .finally(() => setLoading(false));
  }, [token]);

  const filtered = cases.filter(c => {
    const matchSearch = !search || c.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.risk_level === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Screening History</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total} total cases</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Case ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'LOW', 'MEDIUM', 'HIGH'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-navy-200 border-t-navy-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No cases found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Case ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Score</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Level</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/screening/${c.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-mono font-medium text-slate-700">{c.id}</span>
                      {c.demo_mode === 1 && (
                        <span className="ml-2 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                          DEMO
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(c.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 capitalize">
                      {c.document_type?.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-slate-700">{c.risk_score}/100</span>
                    </td>
                    <td className="px-5 py-4">
                      <RiskBadge level={c.risk_level} score={c.risk_score} />
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        c.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        c.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
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
