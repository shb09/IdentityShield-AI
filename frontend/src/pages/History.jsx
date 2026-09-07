import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiGet } from '../api';
import RiskBadge from '../components/RiskBadge';
import { Search, Clock, ChevronRight } from 'lucide-react';

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
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Screening History</h1>
        <p className="text-sm text-slate-400 mt-0.5">{total} total cases</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3.5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input type="text" placeholder="Search by Case ID..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 placeholder:text-slate-300" />
        </div>
        <div className="flex gap-1.5">
          {['all', 'LOW', 'MEDIUM', 'HIGH'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filter === f ? 'bg-[#6366f1] text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 border border-slate-200'
              }`}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-14">
            <div className="w-6 h-6 border-2 border-indigo-200 border-t-[#6366f1] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14">
            <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No cases found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Case ID</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Risk Score</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Level</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => (
                  <tr key={c.id} onClick={() => navigate(`/screening/${c.id}`)} className="hover:bg-indigo-50/30 cursor-pointer transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono font-semibold text-slate-600">{c.id}</span>
                      {c.demo_mode === 1 && (
                        <span className="ml-2 text-[9px] bg-indigo-50 text-[#6366f1] px-1.5 py-0.5 rounded-md font-bold">DEMO</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 capitalize">{c.document_type?.replace('_', ' ')}</td>
                    <td className="px-5 py-3.5"><span className="text-xs font-bold text-slate-600">{c.risk_score}/100</span></td>
                    <td className="px-5 py-3.5"><RiskBadge level={c.risk_level} score={c.risk_score} /></td>
                    <td className="px-5 py-3.5"><ChevronRight className="w-3.5 h-3.5 text-slate-300" /></td>
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
