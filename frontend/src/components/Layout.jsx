import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Shield, LayoutDashboard, FileSearch, History, LogOut, Sun, Moon, Palette, Menu, X, ChevronRight, Zap } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/screening/new', icon: FileSearch, label: 'New Screening' },
  { to: '/history', icon: History, label: 'History' },
];

const themes = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'deep-blue', label: 'Deep Blue', icon: Moon },
  { id: 'dark', label: 'Midnight', icon: Palette },
];

export default function Layout() {
  const { user, logout, theme, setTheme } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      <div className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 interactive" style={{ background: 'var(--accent-gradient)', boxShadow: '0 4px 16px var(--accent-glow)' }}>
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>IdentityShield AI</h1>
          <div className="flex items-center gap-1 mt-0.5">
            <Zap className="w-2.5 h-2.5" style={{ color: 'var(--accent)' }} />
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>SIH 2026</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 stagger">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 interactive ${isActive ? 'text-white' : ''}`
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--accent-gradient)' : 'transparent',
              color: isActive ? 'white' : 'var(--text-secondary)',
              boxShadow: isActive ? '0 4px 16px var(--accent-glow)' : 'none',
            })}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-2 relative">
        <button
          onClick={() => setThemeOpen(!themeOpen)}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 interactive"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Palette className="w-4 h-4" />
          Theme
          <ChevronRight className={`w-3 h-3 ml-auto transition-transform duration-300 ${themeOpen ? 'rotate-90' : ''}`} />
        </button>
        {themeOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 p-1.5 rounded-xl animate-slide-up" style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-lg)' }}>
            {themes.map(t => {
              const Icon = t.icon;
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium w-full transition-all duration-200"
                  style={{
                    background: active ? 'var(--accent-glow)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                  {active && <div className="w-1.5 h-1.5 rounded-full ml-auto animate-glow" style={{ background: 'var(--accent)' }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 mt-auto" style={{ borderTop: '1px solid var(--border-card)' }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl interactive" style={{ background: 'var(--bg-input)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: 'var(--accent-gradient)' }}>
            {user?.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.username || 'Unknown'}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{user?.role || 'user'}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-lg transition-all duration-200 interactive" style={{ color: 'var(--text-muted)' }} title="Logout"
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mesh" style={{ background: 'var(--bg-deep)' }}>
      <aside className="fixed left-0 top-0 bottom-0 w-60 hidden lg:flex flex-col z-30" style={{ background: 'var(--bg-card-solid)', borderRight: '1px solid var(--border-card)', boxShadow: 'var(--shadow-xs)' }}>
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-4 gap-3" style={{ background: 'var(--bg-card-solid)', borderBottom: '1px solid var(--border-card)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg interactive" style={{ color: 'var(--text-secondary)' }}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-gradient)' }}>
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>IdentityShield AI</span>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 animate-slide-up" style={{ background: 'var(--bg-card-solid)', boxShadow: 'var(--shadow-lg)' }}>
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      <main className="lg:ml-60 min-h-screen pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
