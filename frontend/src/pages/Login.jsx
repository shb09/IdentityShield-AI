import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Shield, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Fingerprint, Scan } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Please enter credentials'); return; }
    setLoading(true);
    setError('');
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-mesh" style={{ background: 'var(--bg-deep)' }}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-float" style={{ background: 'var(--accent-glow)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-float" style={{ background: 'var(--accent-glow)', animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20" style={{ background: 'var(--accent-gradient)' }} />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center animate-glow" style={{ background: 'var(--accent-gradient)', boxShadow: 'var(--shadow-glow)' }}>
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center animate-pulse" style={{ background: 'var(--success)' }}>
              <Fingerprint className="w-3 h-3 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>IdentityShield AI</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Secure Document Screening System</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="glass-input w-full pl-11 pr-4 py-3 text-sm"
                  placeholder="Enter username" autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-11 pr-11 py-3 text-sm"
                  placeholder="Enter password" autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="badge-danger rounded-xl p-3 text-xs text-center">{error}</div>
            )}

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-card)' }}>
            <p className="text-[11px] font-semibold text-center mb-3" style={{ color: 'var(--text-muted)' }}>Quick Access — Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setUsername('admin'); setPassword('admin123'); }} className="glass-card-hover text-left px-3 py-2.5 rounded-xl transition-all duration-200">
                <p className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>Admin Access</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>admin / admin123</p>
              </button>
              <button onClick={() => { setUsername('officer'); setPassword('officer123'); }} className="glass-card-hover text-left px-3 py-2.5 rounded-xl transition-all duration-200">
                <p className="text-[10px] font-bold" style={{ color: 'var(--success)' }}>Officer Access</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>officer / officer123</p>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] mt-8" style={{ color: 'var(--text-muted)' }}>
          Smart India Hackathon 2026 · Problem ID: 26188
        </p>
      </div>
    </div>
  );
}
