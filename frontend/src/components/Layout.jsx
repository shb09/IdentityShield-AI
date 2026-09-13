import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Shield, LayoutDashboard, Scan, History, LogOut, User, Sun, Moon, Palette, ChevronRight } from 'lucide-react';

const themes = [
  { id: 'deep-blue', label: 'Deep Blue', icon: Palette },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
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
    <div className="min-h-screen bg-mesh" style={{ background: 'var(--bg-deep)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-glow" style={{ background: 'var(--accent-gradient)' }}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>IdentityShield AI</h1>
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Document Screening System</p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Theme Switcher */}
              <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                {themes.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className="p-1.5 rounded-lg transition-all duration-200"
                      style={{
                        background: theme === t.id ? 'var(--accent-glow)' : 'transparent',
                        color: theme === t.id ? 'var(--accent)' : 'var(--text-muted)',
                      }}
                      title={t.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>

              {/* User */}
              <div className="flex items-center gap-2.5 pl-3" style={{ borderLeft: '1px solid var(--border-card)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-glow)' }}>
                  <User className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{user?.full_name || user?.username}</p>
                  <p className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
                </div>
              </div>

              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="p-2 rounded-xl transition-all duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--danger)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-200"
                    style={{
                      background: isActive ? 'var(--accent-glow)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--border-card)'; }}}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                  </button>
                );
              })}
            </nav>

            {/* Disclaimer */}
            <div className="mt-8 p-4 rounded-xl" style={{ background: 'var(--gradient-card)', border: '1px solid var(--border-glass)' }}>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--accent-light)' }}>Disclaimer:</strong> AI-assisted screening tool. Final decisions remain with authorized personnel.
              </p>
            </div>

            {/* Mobile Theme */}
            <div className="mt-4 sm:hidden flex items-center gap-0.5 p-1 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
              {themes.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium transition-all"
                    style={{
                      background: theme === t.id ? 'var(--accent-glow)' : 'transparent',
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

          {/* Mobile Bottom Nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50" style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(24px)', borderTop: '1px solid var(--border-glass)' }}>
            <div className="flex justify-around py-2 px-4">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all"
                    style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-20 md:pb-0 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
