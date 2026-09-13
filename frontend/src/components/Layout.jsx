import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Shield, LayoutDashboard, FileSearch, History, LogOut, Sun, Moon, Palette, ChevronDown, Zap, X } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/screening/new', icon: FileSearch, label: 'Screen' },
  { to: '/history', icon: History, label: 'History' },
];

const themes = [
  { id: 'neo', label: 'Neo', icon: Zap, gradient: 'linear-gradient(135deg, #f0ece4, #faf8f5)' },
  { id: 'dark', label: 'Dark', icon: Moon, gradient: 'linear-gradient(135deg, #0c0e1a, #1a1e35)' },
];

export default function Layout() {
  const { user, logout, theme, setTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [themeOpen, setThemeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const pageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname === '/screening/new') return 'New Screening';
    if (location.pathname === '/history') return 'History';
    if (location.pathname.startsWith('/screening/')) return 'Screening Result';
    return 'IdentityShield AI';
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-50 px-4 sm:px-6" style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(24px) saturate(1.4)', WebkitBackdropFilter: 'blur(24px) saturate(1.4)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center inter" style={{ background: 'var(--gradient-1)', boxShadow: '0 2px 12px var(--accent-glow)' }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight hidden sm:block" style={{ color: 'var(--text-primary)' }}>IdentityShield</span>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-input)' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background: active ? 'var(--gradient-1)' : 'transparent',
                    color: active ? 'white' : 'var(--text-muted)',
                    boxShadow: active ? '0 2px 8px var(--accent-glow)' : 'none',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme picker */}
            <div className="relative">
              <button
                onClick={() => { setThemeOpen(!themeOpen); setMenuOpen(false); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center inter"
                style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
              {themeOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setThemeOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 p-1.5 rounded-xl z-50 anim-scale" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', minWidth: '140px' }}>
                    {themes.map(t => {
                      const Icon = t.icon;
                      const active = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: active ? 'var(--accent-glow)' : 'transparent',
                            color: active ? 'var(--accent)' : 'var(--text-secondary)',
                          }}
                        >
                          <div className="w-4 h-4 rounded-full" style={{ background: t.gradient, border: '1px solid var(--border)' }} />
                          {t.label}
                          {active && <div className="w-1.5 h-1.5 rounded-full ml-auto anim-glow" style={{ background: 'var(--accent)' }} />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* User */}
            <div className="relative">
              <button
                onClick={() => { setMenuOpen(!menuOpen); setThemeOpen(false); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg inter"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'var(--gradient-1)' }}>
                  {user?.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className="text-xs font-medium hidden sm:inline" style={{ color: 'var(--text-primary)' }}>{user?.username}</span>
                <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 p-1.5 rounded-xl z-50 anim-scale" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', minWidth: '160px' }}>
                    <div className="px-3 py-2 mb-1">
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.full_name || user?.username}</p>
                      <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
                    </div>
                    <div className="divider mb-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all"
                      style={{ color: 'var(--danger)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
