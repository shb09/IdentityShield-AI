import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { apiGet } from './api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewScreening from './pages/NewScreening';
import History from './pages/History';
import ScreeningResult from './pages/ScreeningResult';
import { Shield, Loader2 } from 'lucide-react';

const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh" style={{ background: 'var(--bg-deep)' }}>
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-gradient)', boxShadow: '0 0 30px var(--accent-glow)' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading IdentityShield AI...</span>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    document.documentElement.className = theme === 'light' ? '' : `theme-${theme}`;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!token) { setAuthLoading(false); setUser(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet('/api/auth/me');
        if (!cancelled && res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (!cancelled) {
          setToken(null);
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch {
        if (!cancelled) { /* keep token, don't force logout on network error */ }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (authLoading) return <LoadingScreen />;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, theme, setTheme }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/*" element={<ProtectedRoute><Layout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
