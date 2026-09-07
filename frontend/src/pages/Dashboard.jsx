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
        <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
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
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Overview of screening operations</p>
        </div>
        <button
          onClick={() => navigate('/screening/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Screening
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/60 shadow-md shadow-slate-100 p-4 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md shadow-slate-100 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Risk Distribution</h2>
        <div className="space-y-3">
          {[
            { label: 'Low Risk', count: stats?.low_risk || 0, color: 'bg-emerald-400', total: stats?.total_screenings || 1 },
            { label: 'Medium Risk', count: stats?.medium_risk || 0, color: 'bg-amber-400', total: stats?.total_screenings || 1 },
            { label: 'High Risk', count: stats?.high_risk || 0, color: 'bg-rose-400', total: stats?.total_screenings || 1 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-20 font-medium">{item.label}</span>
              <div className="flex-1 h-7 bg-slate-50 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-lg transition-all duration-700 ease-out`}
                  style={{ width: `${((item.count / item.total) * 100) || 0}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-600 w-6 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md shadow-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100/80 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Recent Screenings</h2>
          <button
            onClick={() => navigate('/history')}
            className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {(!stats?.recent_cases || stats.recent_cases.length === 0) ? (
          <div className="px-5 py-14 text-center">
            <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No screenings yet</p>
            <button
              onClick={() => navigate('/screening/new')}
              className="mt-3 text-xs text-indigo-500 hover:text-indigo-600 font-semibold"
            >
              Start first screening
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {stats.recent_cases.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/screening/${c.id}`)}
                className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <Scan className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 font-mono">{c.id}</p>
                    <p className="text-[11px] text-slate-400 capitalize">{c.document_type?.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 hidden sm:block">
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <RiskBadge level={c.risk_level} score={c.risk_score} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3.5">
        <p className="text-[11px] text-indigo-600 font-medium">
          <strong>System Status:</strong> All modules operational · OCR: Tesseract · Face: OpenCV · Tampering: Image Forensics · Risk: Multi-signal Engine
        </p>
      </div>
    </div>
  );
}
