import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { apiFetch, apiPost } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewScreening from './pages/NewScreening';
import ScreeningResult from './pages/ScreeningResult';
import History from './pages/History';
import Layout from './components/Layout';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const res = await apiFetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch {
        // Keep session on network error
      } finally {
        setAuthLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = async (username, password) => {
    const data = await apiPost('/api/auth/login', { username, password });
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh" style={{ background: 'var(--bg-deep)' }}>
        <div className="text-center animate-fade-in">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full animate-spin-slow" style={{ border: '2px solid var(--border-active)', borderTopColor: 'var(--accent)' }} />
            <div className="absolute inset-2 rounded-full animate-spin" style={{ border: '2px solid transparent', borderBottomColor: 'var(--accent-light)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            <Route path="screening/new" element={<NewScreening />} />
            <Route path="screening/:id" element={<ScreeningResult />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
