import React, { useState } from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">IdentityShield AI</h1>
          <p className="text-sm text-slate-400 mt-1">AI-Powered Document Screening</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 p-8 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-400 mb-6">Sign in to access the screening dashboard</p>

          {error && (
            <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span className="text-xs text-rose-600 font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all pr-11 placeholder:text-slate-300"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-200"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 mb-2.5">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                <p className="text-[10px] text-slate-400">Admin</p>
                <p className="text-xs font-mono font-semibold text-slate-600">admin / admin123</p>
              </div>
              <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                <p className="text-[10px] text-slate-400">Officer</p>
                <p className="text-xs font-mono font-semibold text-slate-600">officer / officer123</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-300 mt-6">
          Smart India Hackathon 2026 · PS ID: 26188 · Ministry of Home Affairs
        </p>
      </div>
    </div>
  );
}
