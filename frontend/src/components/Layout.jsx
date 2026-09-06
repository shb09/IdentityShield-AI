import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import {
  Shield, LayoutDashboard, Scan, History, LogOut,
  ChevronRight, User
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/screening/new', label: 'New Screening', icon: Scan },
    { path: '/history', label: 'Screening History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Header */}
      <header className="bg-navy-950 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">IdentityShield AI</h1>
                <p className="text-xs text-blue-300 -mt-0.5">AI-Powered Identity Verification</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300">
                <User className="w-4 h-4" />
                <span>{user?.full_name || user?.username}</span>
                <span className="px-2 py-0.5 bg-navy-800 rounded text-xs font-medium">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-navy-900 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Disclaimer */}
            <div className="mt-8 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> AI-assisted screening. Final decision remains with authorized personnel.
              </p>
            </div>
          </aside>

          {/* Mobile nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
            <div className="flex justify-around py-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex flex-col items-center gap-1 px-3 py-1 ${
                      isActive ? 'text-navy-700' : 'text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-20 md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
