import React from 'react';
import { Outlet } from 'react-router-dom';

const EmployeeLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Minimal Header */}
            <header className="bg-white border-b border-gray-200 h-16 px-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">A</div>
                    <h1 className="text-lg font-semibold text-slate-800 tracking-tight">Autonex <span className="text-slate-400 font-normal">| Employee Portal</span></h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm text-right">
                        <p className="font-medium text-slate-900">John Doe</p>
                        <p className="text-xs text-slate-500">Employee</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                        {/* Avatar Placeholder */}
                        <svg className="w-full h-full text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] p-6">
                    <Outlet />
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="text-center py-6 text-sm text-slate-400">
                Need help? Contact HR at <a href="#" className="text-emerald-600 hover:underline">hr@autonex.com</a>
            </footer>
        </div>
    );
};

export default EmployeeLayout;
