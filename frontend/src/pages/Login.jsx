import React, { useState } from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">IdentityShield AI</h1>
          <p className="text-blue-300 text-sm mt-1">AI-Powered Identity & Document Verification</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Officer Login</h2>
          <p className="text-sm text-slate-500 mb-6">Enter your credentials to access the system</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 disabled:bg-navy-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs font-semibold text-slate-600 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-slate-500">
              <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border">admin</span> / <span className="font-mono bg-white px-1.5 py-0.5 rounded border">admin123</span></p>
              <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border">officer</span> / <span className="font-mono bg-white px-1.5 py-0.5 rounded border">officer123</span></p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-blue-300/50 mt-6">
          Smart India Hackathon 2026 | Problem Statement ID: 26188 | Ministry of Home Affairs
        </p>
      </div>
    </div>
  );
}