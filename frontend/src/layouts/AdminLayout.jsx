import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, X, Search, ChevronDown } from 'lucide-react';
import { navigation } from '../config/navigation';
import api from '../services/api';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { subProjectApi, employeeApi } from '../services/api';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Fetch data for global search (background)
  const { data: searchEmployees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll,
    staleTime: 5 * 60 * 1000
  });
  const { data: searchProjects = [] } = useQuery({
    queryKey: ['sub-projects'],
    queryFn: subProjectApi.getAll,
    staleTime: 5 * 60 * 1000
  });

  const filteredResults = {
    employees: (searchEmployees || []).filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    projects: (searchProjects || []).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
  };

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = async () => {
    try {
      // Call backend to invalidate token
      await api.post('/auth/logout');
    } catch (err) {
      console.error("Logout sync failed", err);
    } finally {
      // SECURE CLEANUP: Clear all local storage data
      localStorage.clear();

      // Clear React Query cache to prevent data leakage
      queryClient.clear();

      // Hard redirect (not navigate) to ensure full page reload
      // This prevents any stale state from persisting
      window.location.href = '/login/admin';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans text-slate-900">
      {/* Sidebar - Dark Professional Theme */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50 bg-slate-950/30">
          <img src="/logo.png" alt="Autonex Logo" className="h-20 object-contain max-w-[180px]" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">
            Platform Overview
          </p>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section (Sidebar Bottom) */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-950/30">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg text-white font-bold text-lg">
              {user.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.email || 'Administrator'}
              </p>
              <p className="text-xs text-slate-400 truncate">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-white/70 hover:text-white hover:bg-red-600/10 hover:border-red-500/30 border border-transparent rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200/60 flex items-center justify-between px-8 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent hidden sm:block">
              {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="relative">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100/50 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 transition-all w-64">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="bg-transparent border-none text-sm outline-none w-full placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                  onFocus={() => setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchQuery.length > 0 && (
                <div className="absolute top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 max-h-96 overflow-auto">
                  {/* Projects */}
                  {filteredResults.projects.length > 0 && (
                    <div>
                      <div className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase">Projects</div>
                      {filteredResults.projects.map(p => (
                        <button key={p.id} onClick={() => navigate('/admin/sub-projects')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700 truncate">
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Employees */}
                  {filteredResults.employees.length > 0 && (
                    <div>
                      <div className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase mt-2">Employees</div>
                      {filteredResults.employees.map(e => (
                        <button key={e.id} onClick={() => navigate('/admin/employees')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700 truncate">
                          {e.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredResults.projects.length === 0 && filteredResults.employees.length === 0 && (
                    <div className="px-4 py-2 text-sm text-slate-400 text-center">No matches found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
