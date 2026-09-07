import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Shield, LayoutDashboard, Scan, History, LogOut, User } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/screening/new', label: 'New Screening', icon: Scan },
    { path: '/history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#fafbff]">
      <header className="bg-white border-b border-indigo-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-[15px] font-bold text-gray-800 tracking-tight">IdentityShield AI</h1>
                <p className="text-[11px] text-gray-400 -mt-0.5 font-medium">Document Screening</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-700 leading-tight">{user?.full_name || user?.username}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <div className="w-px h-6 bg-gray-200 hidden sm:block" />
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50"
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
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
              <p className="text-[11px] text-indigo-600 leading-relaxed">
                <strong>Disclaimer:</strong> AI-assisted screening. Final decision remains with authorized personnel.
              </p>
            </div>
          </aside>

          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-indigo-100 z-50">
            <div className="flex justify-around py-2 px-4">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                      isActive ? 'text-indigo-600' : 'text-gray-400'
                    }`}
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
