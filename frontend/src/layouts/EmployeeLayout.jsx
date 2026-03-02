import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Calendar, Rocket, LogOut, Menu, X, ChevronRight, FileText } from 'lucide-react';

const EmployeeLayout = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = localStorage.getItem('role') || 'employee';
    const ispm = role === 'pm';
    const prefix = ispm ? '/pm' : '/employee';
    const portalLabel = ispm ? 'PM Portal' : 'Employee Portal';
    const accentColor = ispm ? 'blue' : 'emerald';

    const navItems = [
        { to: `${prefix}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        { to: `${prefix}/projects`, label: 'My Projects', icon: FolderKanban },
        { to: `${prefix}/leaves`, label: 'Leaves', icon: Calendar },
        { to: `${prefix}/side-projects`, label: 'Side Projects', icon: Rocket },
        { to: `${prefix}/guidelines`, label: 'Guidelines', icon: FileText },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        navigate(ispm ? '/login/pm' : '/login/employee');
    };

    const linkActiveClass = (isActive) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
            ? `bg-${accentColor}-50 text-${accentColor}-700 shadow-sm`
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
        }`;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg bg-${accentColor}-600 flex items-center justify-center text-white font-bold text-sm`}>A</div>
                            <div>
                                <h1 className="text-sm font-bold text-slate-900 tracking-tight">Autonex</h1>
                                <p className="text-[10px] text-slate-400 -mt-0.5">{portalLabel}</p>
                            </div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => linkActiveClass(isActive)}
                            >
                                <item.icon className="w-4.5 h-4.5" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Info + Logout */}
                    <div className="p-4 border-t border-slate-100">
                        <div className="flex items-center gap-3 mb-3 px-2">
                            <div className={`w-9 h-9 rounded-full bg-${accentColor}-100 flex items-center justify-center text-${accentColor}-700 font-bold text-sm`}>
                                {(user.name || 'U').charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{user.name || 'User'}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email || ''}</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-slate-700">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="hidden lg:block" />
                    <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-xs font-medium bg-${accentColor}-50 text-${accentColor}-700 rounded-full capitalize`}>{role}</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default EmployeeLayout;
