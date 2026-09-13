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
    if (token) {
      apiFetch('/api/auth/me')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Invalid token');
        })
        .then(data => { setUser(data); setAuthLoading(false); })
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }
  }, [token]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="text-center">
          <div className="w-14 h-14 border-3 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-indigo-300/80 text-sm font-medium">Verifying credentials...</p>
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
