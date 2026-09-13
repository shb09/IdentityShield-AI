import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Shield, LayoutDashboard, Scan, History, LogOut, User, Sun, Moon, Palette } from 'lucide-react';

const themes = [
  { id: 'deep-blue', label: 'Deep Blue', icon: Palette, color: '#312e81' },
  { id: 'light', label: 'Light', icon: Sun, color: '#f8fafc' },
  { id: 'dark', label: 'Dark', icon: Moon, color: '#020617' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'deep-blue');

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/screening/new', label: 'New Screening', icon: Scan },
    { path: '/history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow" style={{ background: 'var(--accent)' }}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>IdentityShield AI</h1>
                <p className="text-[11px] -mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>Document Screening</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Switcher */}
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                {themes.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-1.5 rounded-lg transition-all ${
                        theme === t.id ? 'shadow-sm' : 'opacity-40 hover:opacity-70'
                      }`}
                      style={{
                        background: theme === t.id ? 'var(--accent-bg)' : 'transparent',
                        color: theme === t.id ? 'var(--accent)' : 'var(--text-muted)',
                      }}
                      title={t.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-bg)' }}>
                  <User className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{user?.full_name || user?.username}</p>
                  <p className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
                </div>
              </div>
              <div className="w-px h-6 hidden sm:block" style={{ background: 'var(--border-color)' }} />
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside className="hidden md:block w-52 flex-shrink-0">
            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                    style={{
                      background: isActive ? 'var(--accent-bg)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 p-3.5 rounded-xl border" style={{ background: 'var(--accent-bg)', borderColor: 'var(--border-color)' }}>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--accent)' }}>
                <strong>Disclaimer:</strong> AI-assisted screening. Final decision remains with authorized personnel.
              </p>
            </div>

            {/* Mobile Theme Switcher */}
            <div className="mt-4 sm:hidden flex items-center gap-1 p-1 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              {themes.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                      theme === t.id ? 'shadow-sm' : 'opacity-40'
                    }`}
                    style={{
                      background: theme === t.id ? 'var(--accent-bg)' : 'transparent',
                      color: theme === t.id ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                  >
                    <Icon className="w-3 h-3" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="md:hidden fixed bottom-0 left-0 right-0 border-t z-50" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', backdropFilter: 'blur(12px)' }}>
            <div className="flex justify-around py-2 px-4">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors"
                    style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <main className="flex-1 min-w-0 pb-20 md:pb-0 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
