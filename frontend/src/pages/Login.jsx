import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiPost } from '../api';
import { Shield, User, Lock, Loader2, AlertCircle, Eye, EyeOff, Zap } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError('Enter credentials'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await apiPost('/api/auth/login', { username: username.trim(), password });
      login(data.access_token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-deep)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{ background: 'var(--gradient-1)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-[20%] right-[25%] w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ background: 'var(--gradient-2)', filter: 'blur(100px)' }} />
      </div>

      <div className="relative w-full max-w-sm anim-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 anim-float" style={{ background: 'var(--gradient-1)', boxShadow: '0 8px 32px var(--accent-glow)' }}>
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>IdentityShield AI</h1>
          <p className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Zap className="w-3 h-3" style={{ color: 'var(--accent)' }} />
            Document screening system
          </p>
        </div>

        {/* Card */}
        <div className="card p-6" style={{ background: 'var(--gradient-surface)' }}>
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs font-medium badge-danger anim-fade-up">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  className="input w-full pl-9 pr-3 py-2.5 text-sm" placeholder="admin" autoComplete="username" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input w-full pl-9 pr-9 py-2.5 text-sm" placeholder="admin123" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded inter" style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-accent w-full py-2.5 text-sm flex items-center justify-center gap-2 mt-3 disabled:opacity-50 disabled:cursor-not-allowed inter">
              {loading ? <><Loader2 className="w-4 h-4 anim-spin" /> Signing in...</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
          admin / admin123
        </p>
      </div>
    </div>
  );
}
